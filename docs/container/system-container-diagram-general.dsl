workspace "GOD's TRACKER System" "Software Architecture Container Diagram" {

  model {
    owner = person "Individual Owner" "Tracks vehicle location, security status, and receives alerts."
    admin = person "Fleet Administrator" "Manages fleet telemetry, route deviations, and operational reports."

    guardiants = softwareSystem "GuardiAnts" "Web platform for real-time vehicle security and telemetry." {

      webApp = container "Web App" "Delivers static content to the user's browser to initialize the SPA" "Nginx"

      landingPage = container "Landing Page" "Static website displaying GuardiAnts value proposition and subscription plans and directing users to the web app." "HTML5, CSS3, JavaScript"
      spa = container "Single Page Application (SPA)" "Interactive dashboard in Angular." "Angular 18, TypeScript"

      apiApp = container "API Application" "Provides business logic for safety, telemetry and other chore points of the domain model." "Java, Spring Boot"

      db = container "Database" "Stores user profiles, user's units, telemetry information of each one." "PostgreSQL"

      telemetryBroker = container "Telemetry Broker" "Message broker for IoT telemetry ingestion." "Mosquitto (MQTT)"
    }

    iotDevice = softwareSystem "IoT Device (Hardware)" "Embedded hardware transmitting telemetry data."
    mapService = softwareSystem "OpenStreetMap (via Leaflet)" "Free map rendering and geocoding services."
    pushService = softwareSystem "Firebase (FCM)" "Infrastructure for real-time security alerts."
    paymentGateway = softwareSystem "Stripe API" "External service for subscription billing."

    owner -> landingPage "Visits to get to know GuardiAnts"
    owner -> spa "Monitors vehicle in"
    admin -> spa "Manages fleet in"
    admin -> landingPage "Visits to get to know GuardiAnts"

    webApp -> spa "Delivers Angular App"

    landingPage -> spa "Redirects user via CTAs" "HTTPS"
    spa -> apiApp "Consumes REST API" "HTTPS"
    apiApp -> db "Persists data" "JDBC/JPA"
    apiApp -> telemetryBroker "Publishes/Subscribes commands" "MQTT"

    apiApp -> mapService "Geocoding and mapping data" "HTTPS"
    apiApp -> pushService "Sends real-time security alerts" "HTTPS"
    apiApp -> paymentGateway "Processes subscriptions" "HTTPS"

    iotDevice -> telemetryBroker "Publishes telemetry" "MQTT"
    telemetryBroker -> apiApp "Ingestion" "MQTT"
  }

  views {
    container guardiants "ContainersView" {
      include *
      autoLayout
    }

    styles {
      element "Container" {
        background #8c11bd
        color #ffffff
      }
      element "Software System" {
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
