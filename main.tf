provider "aws" {
  region = "us-east-1"
}

resource "aws_vpc" "app_vpc" {
  cidr_block = "10.0.0.0/16"
  enable_dns_support = true
  enable_dns_hostnames = true
  tags = {
    Name = "app_vpc"
  }
}

resource "aws_subnet" "app_subnet" {
  vpc_id = aws_vpc.app_vpc.id
  cidr_block = "10.0.1.0/24"
  availability_zone = "us-east-1a"
  tags = {
    Name = "app_subnet"
  }
}

resource "aws_internet_gateway" "app_gateway" {
  vpc_id = aws_vpc.app_vpc.id
  tags = {
    Name = "app_gateway"
  }
}

resource "aws_route_table" "app_route_table" {
  vpc_id = aws_vpc.app_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.app_gateway.id
  }
  tags = {
    Name = "app_route_table"
  }
}

resource "aws_route_table_association" "a" {
  subnet_id = aws_subnet.app_subnet.id
  route_table_id = aws_route_table.app_route_table.id
}

resource "aws_security_group" "app_sg" {
  name = "app_sg"
  description = "Allow web and db traffic"
  vpc_id = aws_vpc.app_vpc.id

  ingress {
    from_port = 80
    to_port = 80
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] 
  }

  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "app_sg"
  }
}

resource "aws_instance" "app_instance" {
  ami                         = "ami-0a44aefa5a8df82eb"
  instance_type               = "t2.small"
  subnet_id = aws_subnet.app_subnet.id
  security_groups = [aws_security_group.app_sg.id]
  key_name                    = "deployer-key"
  associate_public_ip_address = true
  tags = {
    Name = "app_instance"
  }
}

# BEANSTALK

#Określenie przypisania ip elastycznego do vpc
resource "aws_eip" "pwc_app_eip" {
  vpc = true
}

# Przypisanie elastycznego IP do VPC.
resource "aws_eip_association" "eip_assoc" {
  instance_id   = aws_instance.app_instance.id #połączenie ec2
  allocation_id = aws_eip.pwc_app_eip.id #połączenie elastic ip
}

# Stworzenie aplikacji w beanstalk
resource "aws_elastic_beanstalk_application" "pwc_app" {
  name        = "PWC_TicTacToe"
}
# Stworzneie środowiska beanstalk
resource "aws_elastic_beanstalk_environment" "pwc_app_env" {
  name                = "PWCAppEnvironment"
  application         = aws_elastic_beanstalk_application.pwc_app.name # połączenie z aplikacja
  solution_stack_name = "64bit Amazon Linux 2 v3.8.0 running Docker"

  # Ustawienie odpowiedniego iam, zapewniając uprawnienia do zasobów aws
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = "GroblaInstanceProfile"
  }

  # Ustawienie ssh
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "EC2KeyName"
    value = "deployer-key" # Replace with your SSH key pair name if you plan to SSH into your instance
  }

  # Przypisanie vpc dla środowiska
  setting {
    namespace = "aws:ec2:vpc"
    name      = "VPCId"
    value     = aws_vpc.app_vpc.id
  }

  # Przypisanie podsieci dla środowiska
  setting {
    namespace = "aws:ec2:vpc"
    name      = "Subnets"
    value     = join(",", [aws_subnet.app_subnet.id])
  }

  # Przypisanie grupy bezpieczeństwa dla środowiska
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "SecurityGroups"
    value     = aws_security_group.app_sg.id
  }

  # Ustawienia serwera proxy
  setting {
    namespace = "aws:elasticbeanstalk:environment:proxy"
    name      = "ProxyServer"
    value     = "none"
  }

  # Ustawienia typu środowiska
  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "EnvironmentType"
    value     = "SingleInstance" # wybór typu pojedynczej instancji - lepsze niz load balanced
  }
}