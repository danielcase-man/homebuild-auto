# Import all modules
module "iam" {
  source = "./modules/iam"
}

module "network" {
  source = "./modules/network"
}

module "ecr" {
  source = "./modules/ecr"
}

module "ecs" {
  source = "./modules/ecs"
}

# Root outputs
output "access_key_id" {
  description = "The access key ID for the CICD user"
  value       = module.iam.cicd_key.id
  sensitive   = true
}

output "secret_key" {
  description = "The secret access key for the CICD user"
  value       = module.iam.cicd_key.secret
  sensitive   = true
}

output "repository_url" {
  description = "The URL of the ECR repository"
  value       = module.ecr.repository_url
}

output "vpc_id" {
  description = "The ID of the VPC"
  value       = module.network.vpc_id
}

output "subnet_id" {
  description = "The ID of the public subnet"
  value       = module.network.public_subnet_id
}

output "sg_id" {
  description = "The ID of the ECS security group"
  value       = module.network.ecs_sg_id
}

output "alb_dns_name" {
  description = "The DNS name of the application load balancer"
  value       = module.ecs.alb_dns_name
}

output "ecs_cluster_arn" {
  description = "The ARN of the ECS cluster"
  value       = module.ecs.cluster_arn
}

output "ecs_service_name" {
  description = "The name of the ECS service"
  value       = module.ecs.service_name
}

output "task_definition_arn" {
  description = "The ARN of the ECS task definition"
  value       = module.ecs.task_definition_arn
}
