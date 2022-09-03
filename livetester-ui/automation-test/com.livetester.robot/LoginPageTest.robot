*** Settings ***
Library                Selenium2Library

*** Variable ***
${URL}                 http://localhost:4200/login
${Browser}             googlechrome

*** Keywords ***
Start
                       Open browser                                   http://localhost:4200            chrome
                       Maximize Browser Window

*** Test Cases ****
Login Form
                       Start
                       Wait Until Element Is Visible                  id=login
                       Click Button                                   id=login
                       ${present}=                                    Run Keyword And Return Status    Element Should Be Visible    id=usernameRequired
                       Should Be True                                 ${present} == ${True}
                       ${present}=                                    Run Keyword And Return Status    Element Should Be Visible    id=passwordRequired
                       Should Be True                                 ${present} == ${True}
                       #Login with correct username and Password
                       Wait Until Element Is Visible                  id=username
                       Click Element                                  id=username
                       Input Text                                     id=username                      bob@test.com
                       Wait Until Element Is Visible                  id=password
                       Click Element                                  id=password
                       Input Text                                     id=password                      123qwe
                       Wait Until Element Is Visible                  id=login
                       Click Button                                   id=login


                       Wait Until Element Is Visible                  id=userMenu
                       Click Button                                   id=userMenu
                       Wait Until Element Is Visible                  id=logout
                       Click Button                                   id=logout

                       #Login with incorrect username and Password
                       Wait Until Element Is Visible                  id=username
                       Click Element                                  id=username
                       Input Text                                     id=username                      bob@test.com
                       Wait Until Element Is Visible                  id=password
                       Click Element                                  id=password
                       Input Text                                     id=password                      12qwe
                       Wait Until Element Is Visible                  id=login
                       Click Button                                   id=login

                       sleep                                          2

                       Close Browser
