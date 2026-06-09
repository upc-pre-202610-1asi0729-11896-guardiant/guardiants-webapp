workspace "GOD's TRACKER System" "Component Diagram - FrontEnd Shared" {

  model {
    godstracker = softwareSystem "GOD's TRACKER" "Main system" {

      frontend = container "FrontEnd Shared" "Angular 18 Frontend" {

        domain = component "Domain" "Shared value objects and records (goal-type.record, macros.record) used across frontend BCS"
        infrastructure = component "Infrastructure" "BaseApi and BaseEndpoint HTTP client utilities shared across all frontend BCs."
      }
    }


  }

  views {
    component frontend "ComponentDiagram" {
      include *
      autoLayout
    }

    styles {
      element "Component" {
        background #ff9900
        color #ffffff
      }
    }
  }
}
