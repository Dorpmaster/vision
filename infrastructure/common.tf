provider "aws" {
  profile = "default"
  region = "us-east-1"
}

locals {
  service_name = "vision"
  service_stage = terraform.workspace
}