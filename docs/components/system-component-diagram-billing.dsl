  workspace "GuardiAnts System" "Component Diagram - Billing Context" {

    model {
        godstracker = softwareSystem "GOD's TRACKER" {

            billingContext = container "Billing" "Angular Module for Subscription & Payments" {

                interfacesLayer = component "Interfaces Layer" "Angular Components. Subscription plans, Payment methods, Invoice history."
                appLayer = component "Application Layer" "Angular Services. Orchestrates checkout flows and payment processing logic."
                domainLayer = component "Domain Layer" "TypeScript Models. Subscription, Invoice, PaymentMethod entities."
                infraLayer = component "Infrastructure Layer" "Angular HttpClient. API client for Billing/Stripe endpoints."

                interfacesLayer -> appLayer "Calls"
                appLayer -> domainLayer "Execute suscription rules"
                appLayer -> infraLayer "Delegates payment execution"
                infraLayer -> domainLayer "Maps API responses"
            }

            billingApi = container "Billing API" "Java/Spring Boot. Handles Stripe integration and recurring billing logic."
            frontendShared = container "Frontend Shared" "TypeScript Module. BaseAPI, Interceptors & Shared Utilities."

            infraLayer -> billingApi "POST /payments/checkout" "JSON/HTTPS"
            domainLayer -> frontendShared "Uses" "billing-types.ts"
        }
    }

    views {
        component billingContext {
            include *
            autoLayout lr
        }

        styles {
            element "Component" {
                background #ffc107
                color #000000
            }
        }
    }
}
