*** Settings ***
Library                       Selenium2Library


*** Variable ***
${URL}                        http://localhost:4200/login
${URL-claims}                 http://localhost:4200/create-claims
${Browser}                    googlechrome
${create}                     ClaimType created succesfully
${update}                     ClaimType updated successfully
${delete}                     Claim type deleted succesfully

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

Claim Type
                               #Insert new Claim
                               Sleep                                      6
                               Wait Until Element Is Visible              id=configurationMenu
                               Click Button                               id=configurationMenu
                               Wait Until Element Is Visible              id=claimTypeMenu
                               Click Button                               id=claimTypeMenu
                               Wait Until Element Is Visible              id=claimTypeCode
                               Click Element                              id=claimTypeCode
                               Input Text                                 id=claimTypeCode                 Test Claim
                               Wait Until Element Is Visible              id=formType
                               Click Element                              id=formType
                               Click Element                              id=i
                               Wait Until Element Is Visible              id=description
                               Click Element                              id=description
                               Input Text                                 id=description                   Test Description
                               Sleep                                      4
                               Wait Until Element Is Visible              id=btnSave
                               Click Button                               id=btnSave
                               Wait Until Element Is Visible              id=responseMessage
                               ${createResponse}=                         Get Text                         id=responseMessage
                               Should Be Equal As Strings                 ${createResponse}                ${create}
                               Click Button                               id=closed


                              #Get Record in Grid
                              Sleep                                        1
                              Wait Until Element Is Visible                id=configurationMenu
                              Click Button                                 id=configurationMenu
                              Sleep                                        1
                              Wait Until Element Is Visible                id=claimTypeMenu
                              Click Button                                 id=claimTypeMenu
                              Wait Until Element Is Visible                id=claimTypeList
                              Click Element                                id=claimTypeList
                              Click Element                                id=claimTypeOption
                              Wait Until Element Is Visible                id=editBtn
                              Click Button                                 id=editBtn
                              Sleep                                        3
                              Wait Until Element Is Visible                id=claimTypeCode
                              ${claim}=                                    Get Value                        id=claimTypeCode
                              Wait Until Element Is Visible                id=formType

                              Wait Until Element Is Visible                id=description
                              ${desc}=                                     Get Value                        id=description
                              Wait Until Element Is Visible                id=btnreset
                              Click Button                                 id=btnreset


                              #Update
                              Wait Until Element Is Visible                id=claimTypeList
                              Click Element                                id=claimTypeList
                              Click Element                                id=claimTypeOption
                              Wait Until Element Is Visible                id=editBtn
                              Click Button                                 id=editBtn

                              Wait Until Element Is Visible                id=description
                              Clear Element Text                           id=description
                              Input Text                                   id=description                   Update Test Description
                              Sleep                                        1
                              Wait Until Element Is Visible                id=btnSave
                              Click Button                                 id=btnSave
                              Wait Until Element Is Visible                id=responseMessage
                              ${updateResponse}=                           Get Text                         id=responseMessage
                              Should Be Equal As Strings                   ${updateResponse}                ${update}
                              Wait Until Element Is Visible                id=closed
                              Click Button                                 id=closed

                              #Update to previous
                              Wait Until Element Is Visible                id=claimTypeList
                              Click Element                                id=claimTypeList
                              Click Element                                id=claimTypeOption
                              Wait Until Element Is Visible                id=editBtn
                              Click Button                                 id=editBtn

                              Wait Until Element Is Visible                id=description
                              Clear Element Text                           id=description
                              Input Text                                   id=description                   ${desc}
                              Sleep                                        1
                              Wait Until Element Is Visible                id=btnSave
                              Click Button                                 id=btnSave
                              Wait Until Element Is Visible                id=responseMessage
                              ${updateResponse}=                           Get Text                         id=responseMessage
                              Should Be Equal As Strings                   ${updateResponse}                ${update}
                              Wait Until Element Is Visible                id=closed
                              Click Button                                 id=closed

                              #delete
                              Wait Until Element Is Visible                id=claimTypeList
                              Click Element                                id=claimTypeList
                              Click Element                                id=claimTypeOption
                              Wait Until Element Is Visible                id=deleteBtn
                              Click Button                                 id=deleteBtn
                              Wait Until Element Is Visible                id=confirmDelete
                              Click Element                                id=confirmDelete
                              Wait Until Element Is Visible                id=responseMessage
                              ${deleteResponse}=                            Get Text                         id=responseMessage
                              Should Be Equal As Strings                   ${deleteResponse}                 ${delete}
                              Wait Until Element Is Visible                id=closed
                              Click Button                                 id=closed


                              Close Browser
