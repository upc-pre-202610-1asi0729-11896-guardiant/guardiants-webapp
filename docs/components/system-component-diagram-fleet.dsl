workspace "GuardiAnts System" "Component Diagram - Fleet Context" {

    model {
        godstracker = softwareSystem "GOD's TRACKER" {

            // Contexto Fleet en el Frontend (Angular)
            fleetContext = container "Fleet Context" "Angular Module for Vehicle & Fleet Management" {
                presentation = component "Presentation" "Angular Components. Vehicle list, Fleet dashboard, Assignment forms."
                application = component "Application" "Angular Service. Orchestrates fleet operations and business logic for unit management."
                infrastructure = component "Infrastructure" "Angular HttpClient. HTTP client for Fleet API endpoints."
                domain = component "Domain" "TypeScript Interfaces/Models. Vehicle, Fleet, and Driver models."

                // Relaciones internas del contexto
                presentation -> application "Uses"
                application -> infrastructure "Uses"
                application -> domain "Uses"
                infrastructure -> domain "Creates"
                domain -> infrastructure "Extends BaseApi / Uses BaseEndpoint"
            }

            // Backend y Shared
            fleetApi = container "Fleet API" "Java/Spring Boot. Handles fleet inventory, assignments and grouping logic."
            frontendShared = container "Frontend Shared" "TypeScript Module. Common HTTP utilities and shared value objects."

            // Relaciones externas
            infrastructure -> fleetApi "Calls" "JSON/HTTPS"
            domain -> frontendShared "Uses" "fleet-type.ts"
        }
    }

    views {
        component fleetContext {
            include *
            autoLayout lr
        }

        styles {
            element "Component" {
                background #438dd5
                color #ffffff
            }
        }
    }
}
