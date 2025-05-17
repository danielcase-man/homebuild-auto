# Import modules
module "network" {
  source = "../network"
}

module "ecr" {
  source = "../ecr"
}

# Create execution role for ECS tasks
resource "aws_iam_role" "ecs_execution_role" {
  name = "ecs-execution-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      },
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution_role_policy" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Create ECS cluster
resource "aws_ecs_cluster" "cluster" {
  name = "my-app-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
  
  tags = {
    Name = "my-app-cluster"
  }
}

# Create Application Load Balancer
resource "aws_lb" "alb" {
  name               = "my-app-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [module.network.ecs_sg_id]
  subnets            = [module.network.public_subnet_id]
  
  tags = {
    Name = "my-app-alb"
  }
}

# Create Target Group
resource "aws_lb_target_group" "tg" {
  name        = "my-app-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = module.network.vpc_id
  target_type = "ip"
  
  health_check {
    path                = "/"
    port                = "traffic-port"
    healthy_threshold   = 3
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200-399"
  }
  
  tags = {
    Name = "my-app-target-group"
  }
}

# Create Listener
resource "aws_lb_listener" "listener" {
  load_balancer_arn = aws_lb.alb.arn
  port              = 80
  protocol          = "HTTP"
  
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg.arn
  }
}

# Create Task Definition
resource "aws_ecs_task_definition" "task" {
  family                   = "my-app-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  
  container_definitions = jsonencode([{
    name      = "my-app",
    image     = "${module.ecr.repository_url}:latest",
    essential = true,
    portMappings = [{
      containerPort = 80,
      protocol      = "tcp"
    }],
    logConfiguration = {
      logDriver = "awslogs",
      options = {
        "awslogs-group"         = "/ecs/my-app",
        "awslogs-region"        = "us-east-1",
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
  
  tags = {
    Name = "my-app-task-definition"
  }
}

# Create CloudWatch Log Group
resource "aws_cloudwatch_log_group" "app_logs" {
  name              = "/ecs/my-app"
  retention_in_days = 30
  
  tags = {
    Name = "my-app-logs"
  }
}

# Create ECS Service
resource "aws_ecs_service" "service" {
  name            = "my-app-service"
  cluster         = aws_ecs_cluster.cluster.id
  task_definition = aws_ecs_task_definition.task.arn
  desired_count   = 1
  launch_type     = "FARGATE"
  
  network_configuration {
    subnets          = [module.network.public_subnet_id]
    security_groups  = [module.network.ecs_sg_id]
    assign_public_ip = true
  }
  
  load_balancer {
    target_group_arn = aws_lb_target_group.tg.arn
    container_name   = "my-app"
    container_port   = 80
  }
  
  depends_on = [aws_lb_listener.listener]
  
  tags = {
    Name = "my-app-service"
  }
}

# Outputs
output "cluster_arn" {
  value = aws_ecs_cluster.cluster.arn
}

output "service_name" {
  value = aws_ecs_service.service.name
}

output "alb_dns_name" {
  value = aws_lb.alb.dns_name
}

output "task_definition_arn" {
  value = aws_ecs_task_definition.task.arn
}
