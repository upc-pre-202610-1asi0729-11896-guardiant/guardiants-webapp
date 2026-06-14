  workspace "GuardiAnts System" "Component Diagram - Alerting Presentation" {

    model {
        godstracker = softwareSystem "GOD's TRACKER" {

            alertingPresentation = container "Alerting Presentation" "Angular Module for Notification Management User Interface" {
                acomponents = component "Components" "Angular Components. Real-time toast alerts, badge notification bell, toggle settings."
                aviews = component "Views" "Angular Views. Security incident log view, user notification preferences panel."

                aviews -> acomponents "Composed of / Uses"
            }
        }
    }

    views {
        component alertingPresentation {
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
