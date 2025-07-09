variable "aws_region" {
  type    = string
  default = "us-east-2"
}

variable "aws_profile" {
  type        = string
  description = "AWS CLI profile Terraform should use"
  default     = "tf-admin"
}

variable "project_name" {
  type        = string
  description = "health care scheduling service"
  default     = "hcs-terraform-backend"
}

variable "bucket_name" {
  type        = string
  description = "S3 bucket the application will use"
  default     = "hcs-dev-bucket"
}
