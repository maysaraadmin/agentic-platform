provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "main" {
  name     = "agentic-platform-rg"
  location = "East US"
}

resource "azurerm_kubernetes_cluster" "main" {
  name                = "agentic-platform-aks"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  dns_prefix          = "agentic-platform"

  default_node_pool {
    name       = "default"
    node_count = 2
    vm_size    = "Standard_DS2_v2"
  }

  identity {
    type = "SystemAssigned"
  }
}
