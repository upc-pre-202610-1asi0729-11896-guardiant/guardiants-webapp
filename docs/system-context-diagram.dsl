workspace "GOD's TRACKER System" "Software Architecture Context Diagram" {

  model {
    owner = person "Individual Owner" "Tracks vehicle location, security status, and receives alerts."
    admin = person "Fleet Administrator" "Manages fleet telemetry, route deviations, and operational reports."

    godstracker = softwareSystem "GuardiAnts" "Web platform for real-time vehicle security, IoT telemetry, and fleet analytics."

    iotDevice = softwareSystem "IoT Device (Hardware)" "Embedded hardware transmitting telemetry data." "External"
    mapService = softwareSystem "OpenStreetMap (via Leaflet)" "Free map rendering and geocoding services." "External"
    pushService = softwareSystem "Firebase (FCM)" "Infrastructure for real-time security alerts." "External"
    authProvider = softwareSystem "Identity Service" "Internal module for JWT and session management."
    paymentGateway = softwareSystem "Stripe API" "External service for subscription billing." "External"

    owner -> godstracker "Monitors location and triggers emergency lockdown via"
    admin -> godstracker "Analyzes fleet driving habits and generates reports via"

    godstracker -> mapService "Requests map tiles and location data" "HTTPS"
    godstracker -> pushService "Delivers security alerts and notifications" "HTTPS/FCM"
    iotDevice -> godstracker "Streams telemetry (GPS, engine data, battery)" "MQTT/TLS"
    godstracker -> iotDevice "Sends remote commands (Engine lock, Reboot)" "MQTT/TLS"
    godstracker -> authProvider "Validates user credentials and sessions" "Internal API"
    godstracker -> paymentGateway "Processes recurring subscription payments" "HTTPS/Stripe"
  }

  views {
    systemContext guardiants "ContextView" {
      include *
      autoLayout
    }

    styles {
      element "Software System" {
        background #1168bd
        color #ffffff
      }
      element "External" {
        background #999999
        color #ffffff
      }
      element "Person" {
        shape Person
        background #08427b
        color #ffffff
      }
    }
  }
}
