terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
      version = ">= 6.14.0"
    }
    google-beta = {
      source = "hashicorp/google-beta"
      version = ">= 6.14.0"
    }
  }
  required_version = "1.10.3"
}

provider "google" {
  project = var.project_id
}

provider "google-beta" {
  project = var.project_id
}

data "google_project" "default" {}
