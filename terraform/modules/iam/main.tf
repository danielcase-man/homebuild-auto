resource "aws_iam_user" "cicd" {
  name = "cicd-user"
}

resource "aws_iam_user_policy_attachment" "registry" {
  user       = aws_iam_user.cicd.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess"
}

resource "aws_iam_user_policy_attachment" "ecs" {
  user       = aws_iam_user.cicd.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonECS_FullAccess"
}

resource "aws_iam_access_key" "cicd_key" {
  user = aws_iam_user.cicd.name
}

output "cicd_key" {
  value = aws_iam_access_key.cicd_key
  sensitive = true
}
