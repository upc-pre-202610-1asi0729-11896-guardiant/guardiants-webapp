workspace "GOD's TRACKER System" "Software Architecture Container Diagram" {

  model {

    guardiants = softwareSystem "GuardiAnts" "Web platform for real-time vehicle security and telemetry." {

      webApp = container "Web App" "Delivers static content to the user's browser to initialize the SPA" "Nginx"

      landingPage = container "Landing Page" "Static website displaying GuardiAnts value proposition and subscription plans and directing users to the web app." "HTML5, CSS3, JavaScript"
      spa = container "Single Page Application (SPA)" "Interactive dashboard in Angular." "Angular 18, TypeScript"

      apiApp = container "API Application" "Provides business logic for safety, telemetry and other chore points of the domain model." "Java, Spring Boot"

      db = container "Database" "Stores user profiles, user's units, telemetry information of each one." "PostgreSQL"

      telemetryBroker = container "Telemetry Broker" "Message broker for IoT telemetry ingestion." "Mosquitto (MQTT)"
    }

    webApp -> spa "Delivers Angular App"

    landingPage -> spa "Redirects user via CTAs" "HTTPS"
    spa -> apiApp "Consumes REST API" "HTTPS"
    apiApp -> db "Persists data" "JDBC/JPA"
    apiApp -> telemetryBroker "Publishes/Subscribes commands" "MQTT"

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
        background #1168bd
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
