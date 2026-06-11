  workspace "GuardiAnts System" "Component Diagram - Alerting Context" {

    model {
        godstracker = softwareSystem "GOD's TRACKER" {

            alertingContext = container "Alerting Context" "Angular Module for Security Notifications" {

                presentation = component "Presentation" "Angular Components. Alert center, Notification settings, Push toggle."
                application = component "Application" "Angular Service. Orchestrates notification logic and user preferences."
                infrastructure = component "Infrastructure" "Angular HttpClient / Firebase Adapter. Push notification registration."
                domain = component "Domain" "TypeScript Models. AlertType, NotificationPreference, SecurityEvent."

                pushAdapter = component "Push Adapter" "Firebase FCM/Browser Push. Handles incoming alerts."

                presentation -> application "Uses"
                presentation -> pushAdapter "Displays real-time alerts from"
                application -> infrastructure "Saves user preferences via"
                application -> domain "Applies business rules for alert severity"
                infrastructure -> pushAdapter "Registers device for"
                infrastructure -> domain "Maps incoming alerts to"
            }

            alertingApi = container "Alerting API" "Java/Spring Boot. Handles notification routing and event logging."
            frontendShared = container "Frontend Shared" "TypeScript Module. BaseAPI, Interceptors & Shared Utilities."

            infrastructure -> alertingApi "Calls" "JSON/HTTPS"
            domain -> frontendShared "Uses" "alerting-type.ts"
        }
    }

    views {
        component alertingContext {
            include *
            autoLayout lr
        }

        styles {
            element "Component" {
                background #d9534f
                color #ffffff
            }
        }
    }
}
