  workspace "GuardiAnts System" "Component Diagram - Query Presentation" {

    model {
        godstracker = softwareSystem "GOD's TRACKER" {

            queryPresentation = container "Query Presentation" "Angular Module for Advanced Search & History User Interface" {
                qcomponents = component "Components" "Angular Components. Filter bars, paginated data grids, export buttons."
                qviews = component "Views" "Angular Views. Route history log view, analytical report generator view."

                qviews -> qcomponents "Composed of / Uses"
            }
        }
    }

    views {
        component queryPresentation {
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
