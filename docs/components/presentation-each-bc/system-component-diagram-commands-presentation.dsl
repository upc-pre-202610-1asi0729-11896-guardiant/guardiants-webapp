
workspace "system-component-diagram-commands-presentation.dsl" "Description of system-component-diagram-commands-presentation.dsl" {

    model {
        user = person "User" "A user of the system"

        softwareSystem = softwareSystem "system-component-diagram-commands-presentation.dsl" "Description" {
            webApp = co ntainer "Web Application" "Delivers the UI" "Technology"
            api = c o ntainer "API" "Provides functionality via API" "Technology"
            database = c o ntainer "Database" "Stores data" "Technology" "Database"

            webApp -> api "Uses"
            api -> d at abase "Reads from and writes to"
        }

        user -> s of twareSystem "Uses"
    }

    views {
        systemContext softwareSystem "SystemContext" {
            include *
            autoLayout
        }

        container softwareSystem "Containers" {
            include *
            autoLayout
        }

        styles {
            element "Person" {
                shape Person
                background #08427B
                color #ffffff
            }
            element "Software System" {
                background #1168BD
                color #ffffff
            }
            element "Container" {
                background #438DD5
                color #ffffff
            }
            element "Database" {
                shape Cylinder
            }
        }
    }
}
