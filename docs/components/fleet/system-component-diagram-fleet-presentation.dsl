  workspace "GuardiAnts System" "Component Diagram - Fleet Presentation" {

    model {
        godstracker = softwareSystem "GOD's TRACKER" {

            fleetPresentation = container "Fleet Presentation" "Angular Module for Vehicle & Fleet Management User Interface" {
                fcomponents = component "Components" "Angular Components. Vehicle item cards, driver assignment forms, inventory tables."
                fviews = component "Views" "Angular Views. Fleet dashboard view, vehicle list view, tracking settings panel."

                fviews -> fcomponents "Composed of / Uses"
            }
        }
    }

    views {
        component fleetPresentation {
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
