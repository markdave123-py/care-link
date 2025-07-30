resource "aws_db_subnet_group" "this" {
  name       = "${var.project_name}-subnet-group"
  subnet_ids = data.aws_subnets.default_subnets.ids
  tags = { Project = var.project_name}
}

resource "aws_db_instance" "postgres" {
  identifier              = "${var.project_name}-db"
  engine                  = "postgres"
  engine_version          = "16"
  instance_class          = "db.t3.micro"
  allocated_storage       = 20
  db_name                 = "healthcare"
  username                = "postgres"
  password                = var.db_password
  storage_type            = "gp2"
  skip_final_snapshot     = true
  publicly_accessible     = false
  db_subnet_group_name    = aws_db_subnet_group.this.name
  vpc_security_group_ids  = [aws_security_group.rds_sg.id]
  tags                    = { Project = var.project_name }
}
