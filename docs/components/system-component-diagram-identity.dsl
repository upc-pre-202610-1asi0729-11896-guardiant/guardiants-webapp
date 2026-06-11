workspace "GuardiAnts System" "Component Diagram - Identity Context" {

    model {
        godstracker = softwareSystem "GOD's TRACKER" {

            identityAccess = container "Identity Bounded Context" "Angular Module for Auth & Profile" {
                presentation = component "Presentation" "Angular Components. Login, Register and Profile views."
                application = component "Application" "Angular Service. Orchestrates auth logic and state management."
                infrastructure = component "Infrastructure" "Angular HttpClient. HTTP client for Identity API endpoints."
                domain = component "Domain" "TypeScript Interfaces/Models. User and Credentials models."

                presentation -> application "Uses"
                application -> infrastructure "Uses"
                application -> domain "Uses"
                infrastructure -> domain "Creates"
                domain -> infrastructure "Extends BaseApi / Uses BaseEndpoint"
            }

            identityAccessApi = container "Identity & Access API" "Java/Spring Boot. Handles authentication, JWT and user profiles."
            frontendShared = container "Frontend Shared" "TypeScript Module. Common HTTP utilities and shared value objects used across all BCs."

            infrastructure -> identityAccessApi "Calls" "JSON/HTTPS"
            domain -> frontendShared "Uses" "auth-type.ts"
        }
    }

    views {
        component identityAccess {
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
