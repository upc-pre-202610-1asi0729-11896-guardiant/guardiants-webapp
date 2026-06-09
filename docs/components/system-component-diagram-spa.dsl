workspace "GOD's TRACKER System" "Component Diagram - SPA Bounded Contexts" {

  model {
    godstracker = softwareSystem "GOD's TRACKER" "Main system" {

      spa = container "Single Page Application" "Angular 18 Frontend" {

        frontendShared = component "Frontend Shared" "Common HTTP utilities, interceptors, and BaseAPI services"
        identity = component "Identity Context" "Manages user authentication, JWT storage, and session roles"
        billing = component "Billing Context" "Handles subscription plans, invoice history, and Stripe integration"
        fleet = component "Fleet Context" "Manages vehicle inventory, groups, and assignment of drivers"
        telemetry = component "Telemetry Context" "Visualizes real-time GPS coordinates and sensor data streams"
        alerting = component "Alerting Context" "Manages notification preferences and security event logs"
        commands = component "Commands Context" "Interface for remote vehicle actions (engine lock, reset)"
        query = component "Query Context" "Handles complex searches, filtering, and data retrieval for history"
      }
    }
    fleet -> frontendShared "Uses shared components / Extends BaseAPI"
    telemetry -> frontendShared "Uses shared components / Extends BaseAPI"
    alerting -> frontendShared "Uses shared components / Extends BaseAPI"
    commands -> frontendShared "Uses shared components / Extends BaseAPI"
    query -> frontendShared "Uses shared components / Extends BaseAPI"
    identity -> frontendShared "Uses shared components / Extends BaseAPI"
    billing -> frontendShared "Uses shared components / Extends BaseAPI"

  }

  views {
    component spa "ComponentDiagram" {
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
