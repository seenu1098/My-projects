*** Settings ***
Library                       Selenium2Library


*** Variable ***
${URL}                        http://localhost:4200/login
${URL-claims}                 http://localhost:4200/create-claims
${Browser}                    googlechrome
${create}                     Lookup Data created successfully
${update}                     Lookup Data updated successfully
${delete}                     Lookup Data deleted successfully

*** Keywords ***
Start Browser and Maximize
                              [Arguments]                                  ${url}                           ${Browser}
                              Open browser                                 ${URL}                           ${Browser}
                              Maximize Browser Window


*** Test Cases ***
Login Form
                              ${res}=                                      Start Browser and Maximize       ${URL}                       ${Browser}
                              # Wait Until Element Is Visible              id=login
                              # Click Button                               id=login
                              # ${present}=                                Run Keyword And Return Status    Element Should Be Visible    id=usernameRequired
                              # Should Be True                             ${present} == ${True}
                              # ${present}=                                Run Keyword And Return Status    Element Should Be Visible    id=passwordRequired
                              # Should Be True                             ${present} == ${True}

                              #Login with correct username and Password
                              Wait Until Element Is Visible                id=username
                              Click Element                                id=username
                              Input Text                                   id=username                      bob@test.com
                              Wait Until Element Is Visible                id=password
                              Click Element                                id=password
                              Input Text                                   id=password                      123qwe
                              Wait Until Element Is Visible                id=login
                              Click Button                                 id=login

Lookup Data
                              #Insert new Claim
                              Sleep                                        1s
                              Wait Until Element Is Visible                id=configurationMenu
                              Click Button                                 id=configurationMenu
                              Wait Until Element Is Visible                id=lookupMenu
                              Click Button                                 id=lookupMenu
                             
                              Wait Until Element Is Visible                id=code
                              Click Element                                id=code
                              Input Text                                   id=code                          Test Lookup Data
                              Wait Until Element Is Visible                id=type
                              Click Element                                id=type
                              Click Element                                id=Receiver
                              Wait Until Element Is Visible                id=description
                              Click Element                                id=description
                              Input Text                                   id=description                   Test Description
                              Sleep                                         1s
                              Wait Until Element Is Visible                id=btnSave
                              Click Button                                 id=btnSave
                              Wait Until Element Is Visible                id=responseMessage
                              ${createResponse}=                           Get Text                         id=responseMessage
                              Should Be Equal As Strings                   ${createResponse}                ${create}
                              Click Button                                 id=closed


                              #Get Record in Grid
                              Sleep                                         1s
                              Wait Until Element Is Visible                id=configurationMenu
                              Click Button                                 id=configurationMenu
                              Sleep                                         1s
                              Wait Until Element Is Visible                id=lookupMenu
                              Click Button                                 id=lookupMenu
                              Wait Until Element Is Visible                id=lookupDataList
                              Click Element                                id=lookupDataList
                              Click Element                                id=lookupDataOption
                              Wait Until Element Is Visible                id=editBtn
                              Click Button                                 id=editBtn
                              Sleep                                         1s
                              Wait Until Element Is Visible                id=code
                              ${lookupData}=                               Get Value                        id=code
                              Wait Until Element Is Visible                id=description
                              ${desc}=                                     Get Value                        id=description
                              Wait Until Element Is Visible                id=btnreset
                              Click Button                                 id=btnreset


                              #Update
                              Wait Until Element Is Visible                id=lookupDataList
                              Click Element                                id=lookupDataList
                              Click Element                                id=lookupDataOption
                              Wait Until Element Is Visible                id=editBtn
                              Click Button                                 id=editBtn

                              Wait Until Element Is Visible                id=description
                              Clear Element Text                           id=description
                              Input Text                                   id=description                   Update Test Description
                              Sleep                                         1s
                              Wait Until Element Is Visible                id=btnSave
                              Click Button                                 id=btnSave
                              Sleep  1
                              Wait Until Element Is Visible                id=responseMessage
                              ${updateResponse}=                           Get Text                         id=responseMessage
                              Should Be Equal As Strings                   ${updateResponse}                ${update}
                              Wait Until Element Is Visible                id=closed
                              Click Button                                 id=closed

                              #Update to previous
                              Wait Until Element Is Visible                id=lookupDataList
                              Click Element                                id=lookupDataList
                              Click Element                                id=lookupDataOption
                              Wait Until Element Is Visible                id=editBtn
                              Click Button                                 id=editBtn

                              Wait Until Element Is Visible                id=description
                              Clear Element Text                           id=description
                              Input Text                                   id=description                   ${desc}
                              Sleep                                         1s
                              Wait Until Element Is Visible                id=btnSave
                              Click Button                                 id=btnSave
                              Sleep  1
                              Wait Until Element Is Visible                id=responseMessage
                              ${updateResponse}=                           Get Text                         id=responseMessage
                              Should Be Equal As Strings                   ${updateResponse}                ${update}
                              Wait Until Element Is Visible                id=closed
                              Click Button                                 id=closed

                              #delete
                              Wait Until Element Is Visible                id=lookupDataList
                              Click Element                                id=lookupDataList
                              Click Element                                id=lookupDataOption
                              Wait Until Element Is Visible                id=deleteBtn
                              Click Button                                 id=deleteBtn
                              Wait Until Element Is Visible                id=confirmDelete
                              Click Element                                id=confirmDelete
                              Sleep  1
                              Wait Until Element Is Visible                id=responseMessage
                              ${deleteResponse}=                           Get Text                         id=responseMessage
                              Should Be Equal As Strings                   ${deleteResponse}                ${delete}
                              Wait Until Element Is Visible                id=closed
                              Click Button                                 id=closed


                              Close Browser
