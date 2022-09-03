*** Settings ***
Library                       Selenium2Library


*** Variable ***
${URL}                        http://localhost:4300/login
${Browser}                    chrome
${testcase}                   Test Executed Successfully
${alreadyHave}                Batch name Already Exists
${batchName}                  testExcute
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

ExecuteTestCase Service

                              Sleep                                        1s
                              Wait Until Element Is Visible                id=testcaseExecutinMenu
                              Click Button                                 id=testcaseExecutinMenu
                              Sleep                                        1s
                              Wait Until Element Is Visible                id=execution
                              Click Button                                 id=execution
                              Sleep                                        1s
                              Wait Until Element Is Visible                id=environmentName
                              Click Element                                id=environmentName
                              Click Element                                id=environmentNameList
                              Wait Until Element Is Visible                id=batchName
                              Click Element                                id=batchName
                              ${value} =                                   Evaluate                         random.choice($batchName)    random
                              Input Text                                   id=batchName                     ${value}
                              Sleep                                        1s
                              Wait Until Element Is Visible                id=testcase
                              Click Element                                id=testcase
                              Sleep                                        1s
                              Wait Until Element Is Visible                id=matlabel
                              Click Element                                id=matlabel
                              Wait Until Element Is Visible                id=btnReplacement
                              Click Button                                 id=btnReplacement
                              Sleep                                        1s
                              Wait Until Element Is Visible                id=replaceExecute
                              Click Button                                 id=replaceExecute
                              Wait Until Element Is Visible                id=responseMessage
                              ${testcaseExecuted}=                         Get Text                         id=responseMessage
                              Should Be Equal As Strings                   ${testcaseExecuted}              ${testcase}
                              Wait Until Element Is Visible                id=closed
                              Click Button                                 id=closed

                              Sleep                                        1s
                              Wait Until Element Is Visible                id=environmentName
                              Click Element                                id=environmentName
                              Click Element                                id=environmentNameList
                              Wait Until Element Is Visible                id=batchName
                              Click Element                                id=batchName
                              Input Text                                   id=batchName                     ${value}
                              Sleep                                        1s
                              Wait Until Element Is Visible                id=testcase
                              Click Element                                id=testcase
                              Sleep                                        1s
                              Wait Until Element Is Visible                id=matlabel
                              Click Element                                id=matlabel
                              Wait Until Element Is Visible                id=btnReplacement
                              Click Button                                 id=btnReplacement
                              Sleep                                        1s
                              Wait Until Element Is Visible                id=responseMessage
                              ${testcaseExecuted}=                         Get Text                         id=responseMessage
                              Should Be Equal As Strings                   ${testcaseExecuted}              ${alreadyHave}
                              Wait Until Element Is Visible                id=closed
                              Click Button                                 id=closed




                              Close Browser





