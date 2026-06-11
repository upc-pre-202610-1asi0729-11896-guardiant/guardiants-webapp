  workspace "GuardiAnts System" "Component Diagram - Commands Presentation" {

    model {
        godstracker = softwareSystem "GOD's TRACKER" {

            commandsPresentation = container "Commands Presentation" "Angular Module for Remote Vehicle Actions User Interface" {
                ccomponents = component "Components" "Angular Components. Engine lock switches, horn buttons, action validation popups."
                cviews = component "Views" "Angular Views. Control terminal view, execution response and log panels."

                cviews -> ccomponents "Composed of / Uses"
            }
        }
    }

    views {
        component commandsPresentation {
            include *
            autoLayout lr
        }

        styles {
            element "Component" {
                background #17a2b8
                color #ffffff
            }
        }
    }
}
