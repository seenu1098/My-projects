*** Settings ***
Library                        Selenium2Library

*** Variable ***
${URL}                         http://localhost:4200/login
${Browser}                     googlechrome

*** Keywords ***
Start
                               Open browser                                 http://localhost:4200            chrome
                               Maximize Browser Window

*** Test Cases ***
Elements Configuration Form
                               start
                               Wait Until Element Is Visible                id=login
                               Click Button                                 id=login
                               ${present}=                                  Run Keyword And Return Status    Element Should Be Visible                     id=usernameRequired
                               Should Be True                               ${present} == ${True}
                               ${present}=                                  Run Keyword And Return Status    Element Should Be Visible                     id=passwordRequired
                               Should Be True                               ${present} == ${True}
                               #Login with correct username and Password
                               Wait Until Element Is Visible                id=username
                               Click Element                                id=username
                               Input Text                                   id=username                      bob@test.com
                               Wait Until Element Is Visible                id=password
                               Click Element                                id=password
                               Input Text                                   id=password                      123qwe
                               Wait Until Element Is Visible                id=login
                               Click Button                                 id=login

                               Wait Until Element Is Visible                id=configurationMenu
                               Click Button                                 id=configurationMenu
                               Wait Until Element Is Visible                id=elementConfigsMenu
                               Click Button                                 id=elementConfigsMenu

                               Wait Until Element Is Visible                id=labelList
                               Click Element                                id=labelList
                               Wait Until Element Is Visible                id=labelOption
                               Click Element                                id=labelOption
                               Wait Until Element Is Visible                id=editButton
                               Click Element                                id=editButton
                               sleep                                        1
                               Wait Until Element Is Visible                id=clear
                               Click Button                                 id=clear

                               Wait Until Element Is Visible                id=label
                               Input Text                                   id=label                         test
                               Input Text                                   id=fieldName                     test
                               Wait Until Element Is Visible                id=fieldType
                               Click Element                                id=fieldType
                               Click Element                                id=string
                               Wait Until Element Is Visible                id=fieldType
                               Click Element                                id=yes
                               Wait Until Element Is Visible                id=applicable
                               Click Element                                id=header
                               Input Text                                   id=matchQuery                    test
                               Wait Until Element Is Visible                id=save
                               Click Button                                 id=save
                               Wait Until Element Is Visible                id=responseMessage
                               ${createResponse}=                           Get Text                         id=responseMessage
                               Should Be Equal As Strings                   ${createResponse}                Element Configuration created successfully
                               Wait Until Element Is Visible                id=closed
                               Click Element                                id=closed

                               Wait Until Element Is Visible                id=labelList
                               Click Element                                id=labelList
                               Wait Until Element Is Visible                id=labelOption
                               Click Element                                id=labelOption
                               Wait Until Element Is Visible                id=editButton
                               Click Element                                id=editButton
                               Clear Element Text                           id=fieldName
                               Input Text                                   id=fieldName                     test1
                               Wait Until Element Is Visible                id=save
                               Click Button                                 id=save
                               Wait Until Element Is Visible                id=responseMessage
                               ${updateResponse}=                           Get Text                         id=responseMessage
                               Should Be Equal As Strings                   ${updateResponse}                Element Configuration updated successfully
                               Wait Until Element Is Visible                id=closed
                               Click Element                                id=closed

                               Wait Until Element Is Visible                id=labelList
                               Click Element                                id=labelList
                               Wait Until Element Is Visible                id=labelOption
                               Click Element                                id=labelOption
                               Wait Until Element Is Visible                id=deleteButton
                               Click Element                                id=deleteButton
                               Wait Until Element Is Visible                id=confirmDelete
                               Click Button                                 id=confirmDelete
                               Wait Until Element Is Visible                id=responseMessage
                               ${deleteResponse}=                           Get Text                         id=responseMessage
                               Should Be Equal As Strings                   ${deleteResponse}                Element Configuration deleted Successfully
                               Wait Until Element Is Visible                id=closed
                               Click Element                                id=closed

                               Close Browser

