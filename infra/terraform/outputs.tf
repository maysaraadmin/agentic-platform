output "aks_cluster_name" {
  description = "AKS cluster name"
  value       = azurerm_kubernetes_cluster.main.name
}

output "resource_group_name" {
  description = "Resource group name"
  value       = azurerm_resource_group.main.name
}

output "kube_config" {
  description = "Kube config for AKS"
  value       = azurerm_kubernetes_cluster.main.kube_config_raw
  sensitive   = true
}
