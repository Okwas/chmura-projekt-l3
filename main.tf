# Określenie źródła dostawcy terraforma dla aws oraz działających wersji dostawcy aws (od 5.2 do ostatniej przed 6.0)
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.2"
    }
  }
}

# Definicja dostawcy usług (tutaj AWS) oraz określenie regionu, w którym będą tworzone zasoby (us-east-1) - konto studenckie ma przydzielnony ten region us-east-1
provider "aws" {
  region = "us-east-1"
}


#Tworzenie własnego VPC (Virtual Private Cloud), na którym uruchamiane będą nasze instancje.
resource "aws_vpc" "pwc_vpc" {
  cidr_block           = "10.0.0.0/16" #zakres adresów IP dla VPC (10.0.0.0 - 10.0.255.255)
  tags = {
    Name = "pwc_vpc"
    Terraform = "true"
  }
}

#Tworzenie bramy internetowej w celu umożliwienia komunikacji między zasobami na VPC i Internetem.
resource "aws_internet_gateway" "pwc_igw" {
  vpc_id = aws_vpc.pwc_vpc.id #połączenie z VPC
  tags = {
    Name = "pwc_gateway"
    Terraform = "true"
  }
}

# Tworzenie podsieci w określonej strefie dostępności i w ramach wcześniej utworzonej VPC
resource "aws_subnet" "pwc_public_subnet" {
  vpc_id            = aws_vpc.pwc_vpc.id #połączenie z VPC
  cidr_block        = "10.0.1.0/24" #zakres adresów IP dla podsieci (10.0.1.0 - 10.0.1.255)
  availability_zone = "us-east-1a"
  tags = {
    Name = "pwc_subnet"
    Terraform = "true"
  }
}

#Tworzenie tablicy trasowania dla VPC oraz określenie zasad dla routingu
resource "aws_route_table" "pwc_route_table" {
  vpc_id = aws_vpc.pwc_vpc.id #połączenie z VPC

  route {
    cidr_block = "0.0.0.0/0" #Zdefiniowanuie domyślnej ścieżki dla całego ruchu (cały ruch nie skierowany na adres VPC zosatanie przekirowany na bramę internetową.
    gateway_id = aws_internet_gateway.pwc_igw.id #Połączenie z bramą internetową.
  }
  tags = {
    Name = "pwc_route_table"
    Terraform = "True"
  }
}

#Powiązanie podsieci z tablicą trasowania, abu umożliwić routing.
resource "aws_route_table_association" "pwc_route_table_association" {
  subnet_id      = aws_subnet.pwc_public_subnet.id #połączenie z podsieci
  route_table_id = aws_route_table.pwc_route_table.id # połączenie z tablicą trasowania

}

#Tworzenie grupy bezpieczeństwa
resource "aws_security_group" "pwc_sg" {
  name        = "pwc sg"
  description = "Allow web and ssh traffic"
  vpc_id      = aws_vpc.pwc_vpc.id #połączenie z vpc

  # Zgoda na dostęp HTTP na port 80
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Zgoda na dostęp SSH na port 22
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

 #Zgoda na wychodzący ruch do dowolnego celu na dowolny port z dowolnym protokołem
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Zgoda na dostęp backendu na port 8080
  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "pwc_sg"
    Terraform = "true"
  }
}

#Uruchomienie instancji ec2.
resource "aws_instance" "pwc_app_ec2" {
  ami                    = "ami-0c101f26f147fa7fd"
  instance_type          = "t2.micro"
  subnet_id              = aws_subnet.pwc_public_subnet.id # połączenie z podsiecią
  vpc_security_group_ids = [aws_security_group.pwc_sg.id] # połączenie z grupą bezpieczeństwa
  key_name               = "deployer-key" # para kluczy umożliwijąca komunikację SSh

  tags = {
    Name = "pwc_ec2_instance"
    Terraform = "true"
  }
}

#Określenie przypisania ip elastycznego do vpc
resource "aws_eip" "pwc_app_eip" {
  vpc = true
}

# Przypisanie elastycznego IP do VPC.
resource "aws_eip_association" "eip_assoc" {
  instance_id   = aws_instance.pwc_app_ec2.id #połączenie ec2
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
    value     = "LabInstanceProfile"
  }

  # Ustawienie ssh
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "EC2KeyName"
    value     = "keypair1"
  }

  # Przypisanie vpc dla środowiska
  setting {
    namespace = "aws:ec2:vpc"
    name      = "VPCId"
    value     = aws_vpc.pwc_vpc.id
  }

  # Przypisanie podsieci dla środowiska
  setting {
    namespace = "aws:ec2:vpc"
    name      = "Subnets"
    value     = join(",", [aws_subnet.pwc_public_subnet.id])
  }

  # Przypisanie grupy bezpieczeństwa dla środowiska
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "SecurityGroups"
    value     = aws_security_group.pwc_sg.id
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