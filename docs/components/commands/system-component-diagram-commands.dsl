  workspace "GuardiAnts System" "Component Diagram - Commands Context" {

    model {
        godstracker = softwareSystem "GOD's TRACKER" {

            commandsContext = container "Commands" "Angular Module for Remote Vehicle Control" {

                interfacesLayer = component "Interfaces" "Angular Components & Forms (UI)"
                appLayer = component "Application" "Angular Services (Orchestrators)"
                domainLayer = component "Domain" "TypeScript Models & Logic. Vehicle Command Aggregates & Validation Rules."
                infraLayer = component "Infrastructure" "Angular HttpClient. API client for Command endpoints."

                interfacesLayer -> appLayer "Calls"
                appLayer -> domainLayer "Executes Business Logic / Validation"
                appLayer -> infraLayer "Delegates execution to"
                infraLayer -> domainLayer "Map responses"
            }

            commandsApi = container "Commands API" "Java/Spring Boot."
            frontendShared = container "Frontend Shared" "TypeScript Module. BaseAPI & Utilities."

            infraLayer -> commandsApi "POST /commands" "JSON/HTTPS"
            domainLayer -> frontendShared "Uses" "base-types.ts"
        }
    }

    views {
        component commandsContext {
            include *
            autoLayout lr
        }

        styles {
            element "Component" {
                background #007bff
                color #ffffff
            }
        }
    }
}
