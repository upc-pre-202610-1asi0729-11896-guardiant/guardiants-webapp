
workspace "GOD's Tracker" "Component Diagram - SPA Bounded Contexts Overview" {

  model {
    godstracker = softwareSystem "GOD's Tracker" "Main system" {

      frontendShared = container "Frontend Shared" "TypeScript Module. BaseAPI, Interceptors & shared value objects used across all frontend BCs."
      identity = container "Identity" "Angular Module. Manages user authentication, JWT storage, and session roles."
      billing = container "Billing" "Angular Module. Handles subscription plans, invoice history, and Stripe integration."
      fleet = container "Fleet" "Angular Module. Manages vehicle inventory, groups, and device assignment."
      telemetry = container "Telemetry" "Angular Module. Visualizes real-time GPS coordinates and sensor data streams."
      alerting = container "Alerting" "Angular Module. Manages notification preferences and security event logs."
      commands = container "Commands" "Angular Module. Interface for remote vehicle actions (engine lock, restart)."
      query = container "Query" "Angular Module. Handles complex searches, filtering, and historical data retrieval."

      identity -> frontendShared "Uses shared utilities / extends BaseAPI"
      billing -> frontendShared "Uses shared utilities / extends BaseAPI"
      fleet -> frontendShared "Uses shared utilities / extends BaseAPI"
      telemetry -> frontendShared "Uses shared utilities / extends BaseAPI"
      alerting -> frontendShared "Uses shared utilities / extends BaseAPI"
      commands -> frontendShared "Uses shared utilities / extends BaseAPI"
      query -> frontendShared "Uses shared utilities / extends BaseAPI"
    }
  }

  views {
    container godstracker "FrontendModulesOverview" {
      include *
      autoLayout
    }

    styles {
      element "Container" {
        background #ff9900
        color #ffffff
      }
    }
  }
}
