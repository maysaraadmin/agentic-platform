variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
  default     = "agentic-platform-rg"
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "East US"
}

variable "cluster_name" {
  description = "AKS cluster name"
  type        = string
  default     = "agentic-platform-aks"
}
