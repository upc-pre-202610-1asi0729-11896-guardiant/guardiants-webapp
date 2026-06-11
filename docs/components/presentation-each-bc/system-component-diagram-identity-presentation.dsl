  workspace "GuardiAnts System" "Component Diagram - Identity Presentation" {

    model {
        godstracker = softwareSystem "GOD's TRACKER" {

            identityPresentation = container "Identity Presentation" "Angular Module for Authentication & Profiles User Interface" {
                icomponents = component "Components" "Angular Components. Credential inputs, password visibility buttons, avatar uploads."
                iviews = component "Views" "Angular Views. Login view, registration view, user profile details tab."

                iviews -> icomponents "Composed of / Uses"
            }
        }
    }

    views {
        component identityPresentation {
            include *
            autoLayout lr
        }

        styles {
            element "Component" {
                background #6f42c1
                color #ffffff
            }
        }
    }
}
