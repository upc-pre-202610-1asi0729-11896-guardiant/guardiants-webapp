  workspace "GOD's Tracker" "Component Diagram - Telemetry Context" {

  model {
    godstracker = softwareSystem "GOD's Tracker" {

      telemetryApi = container "Telemetry API" "Java/Spring Boot. IoT ingestion & historical data."
      frontendShared = container "Frontend Shared" "TypeScript Module. BaseAPI, Interceptors & Shared Utilities."

      telemetryContext = container "Telemetry" "Angular Module for Real-time Telemetry" {

        presentation = component "Presentation" "Angular Components. Live Map, Telemetry Dashboard, Charts."
        application = component "Application" "Angular Service. Orchestrates data stream processing and signal interpretation."
        infrastructure = component "Infrastructure" "Angular HttpClient / WebSocket Client. Real-time stream listeners & API clients."
        domain = component "Domain" "TypeScript Models. TelemetryData, GeoLocation, VehicleSignal."
        mapAdapter = component "Map Adapter" "Leaflet/OpenStreetMap. Renders live vehicle positions."

        presentation -> application "Uses"
        presentation -> mapAdapter "Visualizes fleet on"
        application -> infrastructure "Subscribes to data streams"
        application -> domain "Processes business rules"
        infrastructure -> mapAdapter "Feeds coordinates to"
        infrastructure -> domain "Maps stream events to"
        infrastructure -> telemetryApi "Polls historical data" "JSON/HTTPS"
        domain -> frontendShared "Uses" "telemetry-type.ts"
      }
    }
  }

  views {
    component telemetryContext "TelemetryComponents" {
      include *
      autoLayout lr
    }

    styles {
      element "Component" {
        color #ffffff
      }
    }
  }
}
