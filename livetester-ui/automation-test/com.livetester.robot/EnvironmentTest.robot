*** Settings ***
Library                Selenium2Library

*** Variable ***
${URL}                 http://localhost:4200/login
${Browser}             googlechrome

*** Keywords ***
Start
                       Open browser                                 http://localhost:4200            chrome
                       Maximize Browser Window

*** Test Cases ****
Environment Form
                       Start
                       Wait Until Element Is Visible                id=login
                       Click Button                                 id=login
                       ${present}=                                  Run Keyword And Return Status    Element Should Be Visible           id=usernameRequired
                       Should Be True                               ${present} == ${True}
                       ${present}=                                  Run Keyword And Return Status    Element Should Be Visible           id=passwordRequired
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
                       sleep                                        1
                       Wait Until Element Is Visible                id=environmentMenu
                       Click Button                                 id=environmentMenu
                       sleep                                        1
                       Wait Until Element Is Visible                id=manageEnvironment
                       Click Button                                 id=manageEnvironment
                       sleep                                        1

                       Wait Until Element Is Visible                id=environmentList
                       Click Element                                id=environmentList
                       Wait Until Element Is Visible                id=environmentOption
                       Click Element                                id=environmentOption
                       Wait Until Element Is Visible                id=editButton
                       Click Element                                id=editButton
                       sleep                                        1
                       Wait Until Element Is Visible                id=clear
                       Click Button                                 id=clear

                       Wait Until Element Is Visible                id=environmentName
                       Input Text                                   id=environmentName               test
                       Input Text                                   id=targetFolder                  test
                       Wait Until Element Is Visible                id=protocol
                       Click Element                                id=protocol
                       Click Element                                id=SFTP
                       Input Text                                   id=host                          test
                       Input Text                                   id=port                          123
                       Wait Until Element Is Visible                id=logonType
                       Click Element                                id=logonType
                       Click Element                                id=none
                       Wait Until Element Is Visible                id=dbType
                       Click Element                                id=dbType
                       Click Element                                id=oracle
                       Input Text                                   id=dbHost                        test
                       Input Text                                   id=dbPort                        123
                       Input Text                                   id=dbUsername                    test
                       Input Text                                   id=dbPassword                    test
                       Input Text                                   id=dbName                        test
                       Input Text                                   id=schemaName                    test
                       Wait Until Element Is Visible                id=save
                       Click Button                                 id=save
                       Wait Until Element Is Visible                id=responseMessage
                       ${createResponse}=                           Get Text                         id=responseMessage
                       Should Be Equal As Strings                   ${createResponse}                Environment created successfully
                       Wait Until Element Is Visible                id=closed
                       Click Element                                id=closed


                       Wait Until Element Is Visible                id=environmentList
                       Click Element                                id=environmentList
                       Wait Until Element Is Visible                id=environmentOption
                       Click Element                                id=environmentOption
                       Wait Until Element Is Visible                id=editButton
                       Click Element                                id=editButton
                       sleep                                        1
                       Wait Until Element Is Visible                id=dbPassword
                       Input Text                                   id=dbPassword                    123qwe
                       Wait Until Element Is Visible                id=save
                       Click Button                                 id=save

                       Wait Until Element Is Visible                id=responseMessage
                       ${updateResponse}=                           Get Text                         id=responseMessage
                       Should Be Equal As Strings                   ${updateResponse}                Environment updated successfully
                       Wait Until Element Is Visible                id=closed
                       Click Element                                id=closed

                       Wait Until Element Is Visible                id=environmentList
                       Click Element                                id=environmentList
                       Wait Until Element Is Visible                id=environmentOption
                       Click Element                                id=environmentOption
                       Wait Until Element Is Visible                id=deleteButton
                       Click Element                                id=deleteButton
                       Wait Until Element Is Visible                id=confirmDelete
                       Click Button                                 id=confirmDelete
                       Wait Until Element Is Visible                id=responseMessage
                       ${deleteResponse}=                           Get Text                         id=responseMessage
                       Should Be Equal As Strings                   ${deleteResponse}                Environment deleted Successfully
                       Wait Until Element Is Visible                id=closed
                       Click Element                                id=closed



                       Close Browser

