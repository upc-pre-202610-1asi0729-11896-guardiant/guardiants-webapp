  workspace "GuardiAnts System" "Component Diagram - Telemetry Presentation" {

    model {
        godstracker = softwareSystem "GOD's TRACKER" {

            telemetryPresentation = container "Telemetry Presentation" "Angular Module for Real-time Data Visualization User Interface" {
                tcomponents = component "Components" "Angular Components. Leaflet map markers, real-time chart widgets, speed gauges."
                tviews = component "Views" "Angular Views. Live vehicle tracking view, sensor telemetry dashboard."

                tviews -> tcomponents "Composed of / Uses"
            }
        }
    }

    views {
        component telemetryPresentation {
            include *
            autoLayout lr
        }

        styles {
            element "Component" {
                background #28a745
                color #ffffff
            }
        }
    }
}
