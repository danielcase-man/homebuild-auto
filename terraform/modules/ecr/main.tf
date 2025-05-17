resource "aws_ecr_repository" "app" {
  name = "my-app"
  image_scanning_configuration {
    scan_on_push = true
  }
  
  tags = {
    Name = "my-app-repository"
  }
}

output "repository_url" {
  value = aws_ecr_repository.app.repository_url
}

output "repository_name" {
  value = aws_ecr_repository.app.name
}
