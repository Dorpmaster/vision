resource "aws_cognito_user_pool" "user_pool" {
  name = "vision_user_pool"
  username_attributes = ["email"]
  auto_verified_attributes = ["email"]
  schema {
    attribute_data_type = "Boolean"
    name = "custom_skip_a_ctrl"
    mutable = true
  }
  tags = {
    "project" = local.service_name
  }
}

resource "aws_cognito_user_pool_domain" "user_pool_domain" {
  domain = "dorpmaster-vision"
  user_pool_id = aws_cognito_user_pool.user_pool.id
}

resource "aws_cognito_user_pool_client" "user_pool_client" {
  name = "vision_user_pool_client"
  user_pool_id = aws_cognito_user_pool.user_pool.id
  generate_secret = true
  explicit_auth_flows = ["ADMIN_NO_SRP_AUTH"]
  prevent_user_existence_errors = "ENABLED"
}

resource "aws_ssm_parameter" "user_pool_arn" {
  name = join("-", [local.service_name, local.service_stage, "user_pool_arn"])
  type = "String"
  value = aws_cognito_user_pool.user_pool.arn
  tags = {
    "project" = local.service_name
  }
}