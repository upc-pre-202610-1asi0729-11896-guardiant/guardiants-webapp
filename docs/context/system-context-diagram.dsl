  workspace "GOD's Tracker" "Software Architecture Context Diagram - GuardiAnts" {

  model {
    visitor = person "Visitor" "Explores the landing page, learns about the product, and registers for an account."
    owner = person "Individual Owner" "Tracks vehicle location, security status, and receives alerts."
    admin = person "Fleet Administrator" "Manages fleet telemetry for companies and government organizations, route deviations, and operational reports."

    godstracker = softwareSystem "GOD's Tracker" "Web platform by GuardiAnts for real-time vehicle security, IoT telemetry, and fleet analytics."

    iotDevice = softwareSystem "IoT Device (Hardware)" "Embedded hardware transmitting telemetry data." "External"
    mapService = softwareSystem "OpenStreetMap (via Leaflet)" "Map rendering service." "External"
    pushService = softwareSystem "Firebase (FCM)" "Infrastructure for real-time push notifications and security alerts." "External"
    paymentGateway = softwareSystem "Stripe API" "External service for subscription billing." "External"

    visitor -> godstracker "Browses landing page, registers, and contacts support via"
    owner -> godstracker "Monitors location, configures alerts, and triggers emergency lockdown via"
    admin -> godstracker "Manages fleet vehicles, monitors telemetry, and generates operational reports via"

    godstracker -> mapService "Requests map tiles" "HTTPS"
    godstracker -> pushService "Delivers security alerts and notifications" "HTTPS/FCM"
    iotDevice -> godstracker "Streams telemetry (GPS, engine data, battery)" "MQTT/TLS"
    godstracker -> iotDevice "Sends remote commands (Engine lock, Reboot)" "MQTT/TLS"
    godstracker -> paymentGateway "Processes recurring subscription payments" "HTTPS/Stripe"
  }

  views {
    systemContext godstracker "ContextView" {
      include *
      autoLayout
    }

    styles {
      element "Software System" {
        background #8c11bd
        color #ffffff
      }
      element "External" {
        background #999999
        color #ffffff
      }
      element "Person" {
        shape Person
        background #08177b
        color #ffffff
      }
    }
  }
}
