data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]
  filter { 
    name = "name"
    values = ["al2023-ami-minimal-*-x86_64"] 
    }
}

resource "aws_instance" "app_host" {
  ami                         = data.aws_ami.al2023.id
  instance_type               = "t3.micro"
  key_name                    = var.key_pair_name
  vpc_security_group_ids      = [aws_security_group.ec2_sg.id]
  tags                        = { Name = "${var.project_name}-host", Project = var.project_name }

  user_data = base64encode(templatefile("${path.module}/user_data.sh.tpl", {
    region        = var.aws_region
    repo_url      = aws_ecr_repository.app_repo.repository_url
    db_endpoint   = aws_db_instance.postgres.endpoint
    db_password   = var.db_password
  }))
}
