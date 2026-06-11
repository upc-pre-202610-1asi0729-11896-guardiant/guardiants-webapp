  workspace "GuardiAnts System" "Component Diagram - Query Context" {

    model {
        guardiants = softwareSystem "GOD's TRACKER" {

            queryContext = container "Query" "Angular Module for Advanced Search & Reporting" {

                presentation = component "Presentation" "Angular Components. Search filters, History tables, Report viewers."
                application = component "Application" "Angular Service. Orchestrates query params and complex data retrieval."
                infrastructure = component "Infrastructure" "Angular HttpClient. API client for Search/Query endpoints."
                domain = component "Domain" "TypeScript Models. QueryResults, ReportTemplates, SearchCriteria."

                reportAdapter = component "Report Adapter" "Exporter utility. Handles PDF/CSV generation logic."

                presentation -> application "Uses"
                presentation -> reportAdapter "Triggers exports from"
                application -> infrastructure "Executes search via"
                application -> domain "Processes filtered results"
                infrastructure -> reportAdapter "Feeds data to"
                infrastructure -> domain "Maps response DTOs to"
            }

            // Backend y Shared
            queryApi = container "Query API" "Java/Spring Boot. Handles optimized search queries and report generation."
            frontendShared = container "Frontend Shared" "TypeScript Module. BaseAPI, Interceptors & Shared Utilities."

            // Relaciones externas
            infrastructure -> queryApi "Fetches data" "JSON/HTTPS"
            domain -> frontendShared "Uses" "query-type.ts"
        }
    }

    views {
        component queryContext {
            include *
            autoLayout lr
        }

        styles {
            element "Component" {
                background #f0ad4e
                color #ffffff
            }
        }
    }
}
