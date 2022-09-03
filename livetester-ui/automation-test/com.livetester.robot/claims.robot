*** Settings ***
Library                       Selenium2Library


*** Variable ***
${URL}                        http://localhost:4200/login
${URL-claims}                 http://localhost:4200/create-claims
${Browser}                    chrome
${update}                     Testcase updated successfully
${create}                     Testcase created successfully
${exist}                      Testcase name already exists


*** Keywords ***
Start Browser and Maximize
                              [Arguments]                                  ${url}                           ${Browser}
                              Open browser                                 ${URL}                           ${Browser}
                              Maximize Browser Window


*** Test Cases ***
Login Form
                              ${res}=                                      Start Browser and Maximize       ${URL}                                     ${Browser}
                              # Wait Until Element Is Visible              id=login
                              # Click Button                               id=login
                              # ${present}=                                Run Keyword And Return Status    Element Should Be Visible                  id=usernameRequired
                              # Should Be True                             ${present} == ${True}
                              # ${present}=                                Run Keyword And Return Status    Element Should Be Visible                  id=passwordRequired
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

Claim Service

                              
                              #create
                              Sleep                                        1s
                              Wait Until Element Is Visible                id=claimsMenu
                              Click Button                                 id=claimsMenu
                              Sleep                                        1s
                              Wait Until Element Is Visible                id=createClaims
                              Click Button                                 id=createClaims
                              Wait Until Element Is Visible                id=templateName
                              Click Element                                id=templateName
                              Click Element                                id=templateList
                              Wait Until Element Is Visible                id=claimName
                              Click Element                                id=claimName
                              Input Text                                   id=claimName                     Claim Test1231

                              Wait Until Element Is Visible                id=claimTestGroup
                              Click Element                                id=claimTestGroup
                              Wait Until Element Is Visible                id=claimTestGroupList
                              Click element                                id=claimTestGroupList

                              Press key                                    id=claimTestGroupList            \t

                              Wait Until Element Is Visible                id=getTemplatebtn
                              Click Button                                 id=getTemplatebtn
                              Sleep                                        1s
                              Wait Until Element Is Visible                id=save
                              Click Button                                 id=save
                              Sleep                                        1s
                              Wait Until Element Is Visible                id=responseMessage
                              ${createResponse}=                           Get Text                         id=responseMessage
                              Log To Console                               ${createResponse}

                              Wait Until Element Is Visible                id=closed
                              Click Button                                 id=closed


#Create Duplicate
                              Sleep                                        1s
                              Wait Until Element Is Visible                id=claimsMenu
                              Click Button                                 id=claimsMenu
                              Sleep                                        1s
                              Wait Until Element Is Visible                id=listClaims
                              Click Button                                 id=listClaims
                              Wait Until Element Is Visible                id=Claim Test123
                              Click Element                                id=Claim Test123
                              Wait Until Element Is Visible                id=dupeBtn
                              Click Button                                 id=dupeBtn
                              Sleep   1s
                              Wait Until Element Is Visible                id=claimName
                              Click Element                                id=claimName
                    
                              Input Text                                   id=claimName                     NewDuplicateTestcaseTest
                              Wait Until Element Is Visible                id=dupeSaveBtn
                              Click Button                                 id=dupeSaveBtn
                              Wait Until Element Is Visible                id=responseMessage
                              ${createDuplicateResponse}=                  Get Text                         id=responseMessage
                              Click Button                                 id=closed

                                                          
                              #update
                              Sleep                                        1s
                              Wait Until Element Is Visible                id=claimsMenu
                              Click Button                                 id=claimsMenu
                              Sleep                                        1
                              Wait Until Element Is Visible                id=listClaims
                              Click Button                                 id=listClaims
                              Sleep                                        1s
                              Wait Until Element Is Visible                id=Claim Test1231
                              Click Element                                id=Claim Test1231
                              Wait Until Element Is Visible                id=editBtn
                              Click Element                                id=editBtn
                              Wait Until Element Is Visible                id=save
                              Click Element                                id=save
                              Wait Until Element Is Visible                id=responseMessage
                              ${updateResponse}=                           Get Text                         id=responseMessage
                              Should Be Equal As Strings                   ${updateResponse}                ${update}
                              Click Button                                 id=closed
                              
                              #Delete
                              Wait Until Element Is Visible                id=claimsMenu
                              Click Button                                 id=claimsMenu
                              Sleep                                        1
                              Wait Until Element Is Visible                id=listClaims
                              Click Button                                 id=listClaims
                              Wait Until Element Is Visible                id=Claim Test1231
                              Click Element                                id=Claim Test1231
                              Wait Until Element Is Visible                id=deleteBtn
                              Click Element                                id=deleteBtn
                              Wait Until Element Is Visible                id=confirmDelete
                              Click Element                                id=confirmDelete
                              Wait Until Element Is Visible                id=responseMessage
                              ${deleteResponse}=                           Get Text                         id=responseMessage

                              Wait Until Element Is Visible                id=closed
                              Click Button                                 id=closed




                              Close Browser
