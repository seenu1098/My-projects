*** Settings ***
Library                    Selenium2Library

*** Variable ***
${URL}                     http://localhost:4200/login
${Browser}                 googlechrome

*** Keywords ***
Start
                           Open browser                                 http://localhost:4200            chrome
                           Maximize Browser Window
                           Wait Until Element Is Visible                id=login
                           Click Button                                 id=login
                           ${present}=                                  Run Keyword And Return Status    Element Should Be Visible                  id=usernameRequired
                           Should Be True                               ${present} == ${True}
                           ${present}=                                  Run Keyword And Return Status    Element Should Be Visible                  id=passwordRequired
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

*** Test Cases ***
Beneficiary Preset Form
                           Start

                           Wait Until Element Is Visible                id=configurationMenu
                           Click Button                                 id=configurationMenu
                           sleep                                        1
                           Wait Until Element Is Visible                id=environmentMenu
                           Click Button                                 id=environmentMenu
                           sleep                                        1
                           Wait Until Element Is Visible                id=addPresetMenu
                           Click Button                                 id=addPresetMenu
                           sleep                                        1
                           Wait Until Element Is Visible                id=beneficiaryMenu
                           Click Button                                 id=beneficiaryMenu
                           sleep                                        1

                           Wait Until Element Is Visible                id=btnsave
                           Click Button                                 id=btnsave
                           Wait Until Element Is Visible                id=identifierRequired
                           ${present}=                                  Run Keyword And Return Status    Element Should Be Visible                  id=identifierRequired
                           Should Be True                               ${present} == ${True}
                           ${present}=                                  Run Keyword And Return Status    Element Should Be Visible                  id=firstNameRequired
                           Should Be True                               ${present} == ${True}
                           ${present}=                                  Run Keyword And Return Status    Element Should Be Visible                  id=lastNameRequired
                           Should Be True                               ${present} == ${True}
                           ${present}=                                  Run Keyword And Return Status    Element Should Be Visible                  id=beneficiaryDOBRequired
                           Should Be True                               ${present} == ${True}
                           ${present}=                                  Run Keyword And Return Status    Element Should Be Visible                  id=beneficiaryGenderRequired
                           Should Be True                               ${present} == ${True}
                           ${present}=                                  Run Keyword And Return Status    Element Should Be Visible                  id=addressRequired
                           Should Be True                               ${present} == ${True}
                           ${present}=                                  Run Keyword And Return Status    Element Should Be Visible                  id=cityRequired
                           Should Be True                               ${present} == ${True}
                           ${present}=                                  Run Keyword And Return Status    Element Should Be Visible                  id=stateRequired
                           Should Be True                               ${present} == ${True}
                           ${present}=                                  Run Keyword And Return Status    Element Should Be Visible                  id=zipcodeRequired
                           Should Be True                               ${present} == ${True}
                           ${present}=                                  Run Keyword And Return Status    Element Should Be Visible                  id=environmentNameRequired
                           Should Be True                               ${present} == ${True}


                           Wait Until Element Is Visible                id=identifier
                           Input Text                                   id=identifier                    test1
                           Input Text                                   id=firstName                     test1
                           Input Text                                   id=lastName                      test1
                           Input Text                                   id=dob                           5
                           Wait Until Element Is Visible                id=gender
                           Click Element                                id=gender
                           Click Element                                id=male
                           Input Text                                   id=address                       test1
                           Input Text                                   id=city                          test1
                           Input Text                                   id=state                         test1
                           Input Text                                   id=zipcode                       test1
                           Wait Until Element Is Visible                id=environmentList
                           Click Element                                id=environmentList
                           Wait Until Element Is Visible                id=environmentOption
                           Click Element                                id=environmentOption
                           Click Button                                 id=btnsave
                           Wait Until Element Is Visible                id=responseMessage
                           ${createResponse}=                           Get Text                         id=responseMessage
                           Should Be Equal As Strings                   ${createResponse}                Beneficiary Preset Created successfully
                           Log To Console                               ${createResponse}
                           Wait Until Element Is Visible                id=closed
                           Click Element                                id=closed

                           Wait Until Element Is Visible                id=test1
                           Click Element                                id=test1
                           Wait Until Element Is Visible                id=btnreset
                           Click Button                                 id=btnreset

                           Wait Until Element Is Visible                id=test1
                           Click Element                                id=test1
                           Sleep                                        1
                           ${firstName}                                 Get Value                        id=firstName
                           ${lastName}                                  Get Value                        id=lastName
                           Wait Until Element Is Visible                id=firstName
                           Clear Element Text                           id=firstName
                           Clear Element Text                           id=lastName
                           Sleep                                        1
                           Input Text                                   id=firstName                     test name 1
                           Input Text                                   id=lastName                      test name 2
                           Click Button                                 id=btnsave
                           Wait Until Element Is Visible                id=responseMessage
                           ${updateResponse}=                           Get Text                         id=responseMessage
                           Should Be Equal As Strings                   ${updateResponse}                Beneficiary Preset updated successfully
                           Wait Until Element Is Visible                id=closed
                           Click Element                                id=closed

                           Wait Until Element Is Visible                id=test1
                           Click Element                                id=test1
                           Sleep                                        2
                           ${updateFirstName}                           Get Value                        id=firstName
                           Should Be Equal As Strings                   ${updatefirstname}               test name 1
                           ${updateLastName}                            Get Value                        id=lastName
                           Should Be Equal As Strings                   ${updateLastName}                test name 2
                           Click Button                                 id=btnreset

                           Wait Until Element Is Visible                id=test1
                           Click Element                                id=test1
                           Wait Until Element Is Visible                id=firstName
                           Clear Element Text                           id=firstName
                           Clear Element Text                           id=lastName
                           Sleep                                        2
                           Input Text                                   id=firstName                     ${firstName}
                           Input Text                                   id=lastName                      ${lastName}
                           Click Button                                 id=btnsave
                           Wait Until Element Is Visible                id=responseMessage
                           ${updateResponse}=                           Get Text                         id=responseMessage
                           Should Be Equal As Strings                   ${updateResponse}                Beneficiary Preset updated successfully
                           Wait Until Element Is Visible                id=closed
                           Click Element                                id=closed

                           Wait Until Element Is Visible                id=identifier
                           Input Text                                   id=identifier                    test1
                           Input Text                                   id=firstName                     test1
                           Input Text                                   id=lastName                      test1
                           Input Text                                   id=dob                           5
                           Wait Until Element Is Visible                id=gender
                           Click Element                                id=gender
                           Click Element                                id=male
                           Input Text                                   id=address                       test1
                           Input Text                                   id=city                          test1
                           Input Text                                   id=state                         test1
                           Input Text                                   id=zipcode                       test1
                           Wait Until Element Is Visible                id=environmentList
                           Click Element                                id=environmentList
                           Wait Until Element Is Visible                id=environmentOption
                           Click Element                                id=environmentOption
                           Click Button                                 id=btnsave
                           Wait Until Element Is Visible                id=responseMessage
                           ${existResponse}=                            Get Text                         id=responseMessage
                           Should Be Equal As Strings                   ${existResponse}                 Identifier Already Exist
                           Log To Console                               ${existResponse}
                           Wait Until Element Is Visible                id=closed
                           Click Element                                id=closed

                           Wait Until Element Is Visible                id=test1
                           Click Element                                id=test1
                           Wait Until Element Is Visible                id=delete
                           Click Button                                 id=delete
                           Wait Until Element Is Visible                id=confirmDelete
                           Click Button                                 id=confirmDelete
                           Wait Until Element Is Visible                id=responseMessage
                           ${deleteResponse}=                           Get Text                         id=responseMessage
                           Should Be Equal As Strings                   ${deleteResponse}                Beneficiary Preset Deleted successfully
                           Wait Until Element Is Visible                id=closed
                           Click Element                                id=closed

                           Close Browser

*** Test Cases ***
Provider Preset Form
                           Start

                           Wait Until Element Is Visible                id=configurationMenu
                           Click Button                                 id=configurationMenu
                           sleep                                        1
                           Wait Until Element Is Visible                id=environmentMenu
                           Click Button                                 id=environmentMenu
                           sleep                                        1
                           Wait Until Element Is Visible                id=addPresetMenu
                           Click Button                                 id=addPresetMenu
                           sleep                                        1
                           Wait Until Element Is Visible                id=providerMenu
                           Click Button                                 id=providerMenu
                           sleep                                        1

                           Wait Until Element Is Visible                id=btnsave
                           Click Button                                 id=btnsave
                           Wait Until Element Is Visible                id=npiRequired
                           ${present}=                                  Run Keyword And Return Status    Element Should Be Visible                  id=npiRequired
                           Should Be True                               ${present} == ${True}
                           ${present}=                                  Run Keyword And Return Status    Element Should Be Visible                  id=taxonomyRequired
                           Should Be True                               ${present} == ${True}
                           ${present}=                                  Run Keyword And Return Status    Element Should Be Visible                  id=firstNameRequired
                           Should Be True                               ${present} == ${True}
                           ${present}=                                  Run Keyword And Return Status    Element Should Be Visible                  id=lastNameRequired
                           Should Be True                               ${present} == ${True}
                           ${present}=                                  Run Keyword And Return Status    Element Should Be Visible                  id=organizationNameRequired
                           Should Be True                               ${present} == ${True}
                           ${present}=                                  Run Keyword And Return Status    Element Should Be Visible                  id=taxIdRequired
                           Should Be True                               ${present} == ${True}
                           ${present}=                                  Run Keyword And Return Status    Element Should Be Visible                  id=billingTypeRequired
                           Should Be True                               ${present} == ${True}
                           ${present}=                                  Run Keyword And Return Status    Element Should Be Visible                  id=addressRequired
                           Should Be True                               ${present} == ${True}
                           ${present}=                                  Run Keyword And Return Status    Element Should Be Visible                  id=cityRequired
                           Should Be True                               ${present} == ${True}
                           ${present}=                                  Run Keyword And Return Status    Element Should Be Visible                  id=stateRequired
                           Should Be True                               ${present} == ${True}
                           ${present}=                                  Run Keyword And Return Status    Element Should Be Visible                  id=zipcodeRequired
                           Should Be True                               ${present} == ${True}
                           ${present}=                                  Run Keyword And Return Status    Element Should Be Visible                  id=environmentNameRequired
                           Should Be True                               ${present} == ${True}


                           Wait Until Element Is Visible                id=npi
                           Input Text                                   id=npi                           test1
                           Input Text                                   id=taxonomy                      test1
                           Input Text                                   id=firstName                     test1
                           Input Text                                   id=lastName                      test1
                           Input Text                                   id=organizationName              test1
                           Input Text                                   id=tax                           test1
                           Wait Until Element Is Visible                id=type
                           Click Element                                id=type
                           Click Element                                id=individual
                           Input Text                                   id=address                       test1
                           Input Text                                   id=city                          test1
                           Input Text                                   id=state                         test1
                           Input Text                                   id=zipcode                       test1
                           Wait Until Element Is Visible                id=environmentList
                           Click Element                                id=environmentList
                           Wait Until Element Is Visible                id=environmentOption
                           Click Element                                id=environmentOption
                           Click Button                                 id=btnsave
                           Wait Until Element Is Visible                id=responseMessage
                           ${createResponse}=                           Get Text                         id=responseMessage
                           Should Be Equal As Strings                   ${createResponse}                Provider Preset Created successfully
                           Log To Console                               ${createResponse}
                           Wait Until Element Is Visible                id=closed
                           Click Element                                id=closed

                           Wait Until Element Is Visible                id=test1
                           Click Element                                id=test1
                           Wait Until Element Is Visible                id=btnreset
                           Click Button                                 id=btnreset

                           Wait Until Element Is Visible                id=test1
                           Click Element                                id=test1
                           Sleep                                        1
                           ${firstName}                                 Get Value                        id=firstName
                           ${lastName}                                  Get Value                        id=lastName
                           Wait Until Element Is Visible                id=firstName
                           Clear Element Text                           id=firstName
                           Clear Element Text                           id=lastName
                           Sleep                                        1
                           Input Text                                   id=firstName                     test name 1
                           Input Text                                   id=lastName                      test name 2
                           Click Button                                 id=btnsave
                           Wait Until Element Is Visible                id=responseMessage
                           ${updateResponse}=                           Get Text                         id=responseMessage
                           Should Be Equal As Strings                   ${updateResponse}                Provider Preset updated successfully
                           Wait Until Element Is Visible                id=closed
                           Click Element                                id=closed

                           Wait Until Element Is Visible                id=test1
                           Click Element                                id=test1
                           Sleep                                        2
                           ${updateFirstName}                           Get Value                        id=firstName
                           Should Be Equal As Strings                   ${updatefirstname}               test name 1
                           ${updateLastName}                            Get Value                        id=lastName
                           Should Be Equal As Strings                   ${updateLastName}                test name 2
                           Click Button                                 id=btnreset

                           Wait Until Element Is Visible                id=test1
                           Click Element                                id=test1
                           Wait Until Element Is Visible                id=firstName
                           Clear Element Text                           id=firstName
                           Clear Element Text                           id=lastName
                           Sleep                                        2
                           Input Text                                   id=firstName                     ${firstName}
                           Input Text                                   id=lastName                      ${lastName}
                           Click Button                                 id=btnsave
                           Wait Until Element Is Visible                id=responseMessage
                           ${updateResponse}=                           Get Text                         id=responseMessage
                           Should Be Equal As Strings                   ${updateResponse}                Provider Preset updated successfully
                           Wait Until Element Is Visible                id=closed
                           Click Element                                id=closed

                           Wait Until Element Is Visible                id=npi
                           Input Text                                   id=npi                           test1
                           Input Text                                   id=taxonomy                      test1
                           Input Text                                   id=firstName                     test1
                           Input Text                                   id=lastName                      test1
                           Input Text                                   id=organizationName              test1
                           Input Text                                   id=tax                           test1
                           Wait Until Element Is Visible                id=type
                           Click Element                                id=type
                           Click Element                                id=individual
                           Input Text                                   id=address                       test1
                           Input Text                                   id=city                          test1
                           Input Text                                   id=state                         test1
                           Input Text                                   id=zipcode                       test1
                           Wait Until Element Is Visible                id=environmentList
                           Click Element                                id=environmentList
                           Wait Until Element Is Visible                id=environmentOption
                           Click Element                                id=environmentOption
                           Click Button                                 id=btnsave
                           Wait Until Element Is Visible                id=responseMessage
                           ${existResponse}=                            Get Text                         id=responseMessage
                           Should Be Equal As Strings                   ${existResponse}                 Npi Already Exist
                           Log To Console                               ${existResponse}
                           Wait Until Element Is Visible                id=closed
                           Click Element                                id=closed


                           Wait Until Element Is Visible                id=test1
                           Click Element                                id=test1
                           Wait Until Element Is Visible                id=delete
                           Click Button                                 id=delete
                           Wait Until Element Is Visible                id=confirmDelete
                           Click Button                                 id=confirmDelete
                           Wait Until Element Is Visible                id=responseMessage
                           ${deleteResponse}=                           Get Text                         id=responseMessage
                           Should Be Equal As Strings                   ${deleteResponse}                Provider Preset Deleted successfully
                           Wait Until Element Is Visible                id=closed
                           Click Element                                id=closed

                           Close Browser

*** Test Cases ***
Payor Preset Form
                           Start

                           Wait Until Element Is Visible                id=configurationMenu
                           Click Button                                 id=configurationMenu
                           sleep                                        1
                           Wait Until Element Is Visible                id=environmentMenu
                           Click Button                                 id=environmentMenu
                           sleep                                        1
                           Wait Until Element Is Visible                id=addPresetMenu
                           Click Button                                 id=addPresetMenu
                           sleep                                        1
                           Wait Until Element Is Visible                id=payorMenu
                           Click Button                                 id=payorMenu
                           sleep                                        1

                           Wait Until Element Is Visible                id=btnsave
                           Click Button                                 id=btnsave
                           Wait Until Element Is Visible                id=identifierRequired
                           ${present}=                                  Run Keyword And Return Status    Element Should Be Visible                  id=identifierRequired
                           Should Be True                               ${present} == ${True}
                           ${present}=                                  Run Keyword And Return Status    Element Should Be Visible                  id=payorNameRequired
                           Should Be True                               ${present} == ${True}
                           ${present}=                                  Run Keyword And Return Status    Element Should Be Visible                  id=addressRequired
                           Should Be True                               ${present} == ${True}
                           ${present}=                                  Run Keyword And Return Status    Element Should Be Visible                  id=cityRequired
                           Should Be True                               ${present} == ${True}
                           ${present}=                                  Run Keyword And Return Status    Element Should Be Visible                  id=stateRequired
                           Should Be True                               ${present} == ${True}
                           ${present}=                                  Run Keyword And Return Status    Element Should Be Visible                  id=zipcodeRequired
                           Should Be True                               ${present} == ${True}
                           ${present}=                                  Run Keyword And Return Status    Element Should Be Visible                  id=environmentNameRequired
                           Should Be True                               ${present} == ${True}


                           Wait Until Element Is Visible                id=identifier
                           Input Text                                   id=identifier                    test1
                           Input Text                                   id=payorName                     test1
                           Input Text                                   id=address                       test1
                           Input Text                                   id=city                          test1
                           Input Text                                   id=state                         test1
                           Input Text                                   id=zipcode                       test1
                           Wait Until Element Is Visible                id=environmentList
                           Click Element                                id=environmentList
                           Wait Until Element Is Visible                id=environmentOption
                           Click Element                                id=environmentOption
                           Click Button                                 id=btnsave
                           Wait Until Element Is Visible                id=responseMessage
                           ${createResponse}=                           Get Text                         id=responseMessage
                           Should Be Equal As Strings                   ${createResponse}                Payor Preset Created successfully
                           Log To Console                               ${createResponse}
                           Wait Until Element Is Visible                id=closed
                           Click Element                                id=closed

                           Wait Until Element Is Visible                id=test1
                           Click Element                                id=test1
                           Wait Until Element Is Visible                id=btnreset
                           Click Button                                 id=btnreset

                           Wait Until Element Is Visible                id=test1
                           Click Element                                id=test1
                           Sleep                                        1
                           ${address}                                   Get Value                        id=address
                           ${city}                                      Get Value                        id=city
                           Wait Until Element Is Visible                id=address
                           Clear Element Text                           id=address
                           Clear Element Text                           id=city
                           Sleep                                        1
                           Input Text                                   id=address                       test address 1
                           Input Text                                   id=city                          test city 1
                           Click Button                                 id=btnsave
                           Wait Until Element Is Visible                id=responseMessage
                           ${updateResponse}=                           Get Text                         id=responseMessage
                           Should Be Equal As Strings                   ${updateResponse}                Payor Preset updated successfully
                           Wait Until Element Is Visible                id=closed
                           Click Element                                id=closed

                           Wait Until Element Is Visible                id=test1
                           Click Element                                id=test1
                           Sleep                                        1
                           ${updateAddress}                             Get Value                        id=address
                           Should Be Equal As Strings                   ${updateAddress}                 test address 1
                           ${updateCity}                                Get Value                        id=city
                           Should Be Equal As Strings                   ${updateCity}                    test city 1
                           Click Button                                 id=btnreset

                           Wait Until Element Is Visible                id=test1
                           Click Element                                id=test1
                           Wait Until Element Is Visible                id=address
                           Clear Element Text                           id=address
                           Clear Element Text                           id=city
                           Sleep                                        1
                           Input Text                                   id=address                       ${address}
                           Input Text                                   id=city                          ${city}
                           Click Button                                 id=btnsave
                           Wait Until Element Is Visible                id=responseMessage
                           ${updateResponse}=                           Get Text                         id=responseMessage
                           Should Be Equal As Strings                   ${updateResponse}                Payor Preset updated successfully
                           Wait Until Element Is Visible                id=closed
                           Click Element                                id=closed

                           Wait Until Element Is Visible                id=identifier
                           Input Text                                   id=identifier                    test1
                           Input Text                                   id=payorName                     test1
                           Input Text                                   id=address                       test1
                           Input Text                                   id=city                          test1
                           Input Text                                   id=state                         test1
                           Input Text                                   id=zipcode                       test1
                           Wait Until Element Is Visible                id=environmentList
                           Click Element                                id=environmentList
                           Wait Until Element Is Visible                id=environmentOption
                           Click Element                                id=environmentOption
                           Click Button                                 id=btnsave
                           Wait Until Element Is Visible                id=responseMessage
                           ${existResponse}=                            Get Text                         id=responseMessage
                           Should Be Equal As Strings                   ${existResponse}                 Payor Identifier Already Exist
                           Log To Console                               ${existResponse}
                           Wait Until Element Is Visible                id=closed
                           Click Element                                id=closed


                           Wait Until Element Is Visible                id=test1
                           Click Element                                id=test1
                           Wait Until Element Is Visible                id=delete
                           Click Button                                 id=delete
                           Wait Until Element Is Visible                id=confirmDelete
                           Click Button                                 id=confirmDelete
                           Wait Until Element Is Visible                id=responseMessage
                           ${deleteResponse}=                           Get Text                         id=responseMessage
                           Should Be Equal As Strings                   ${deleteResponse}                Payor Preset Deleted successfully
                           Wait Until Element Is Visible                id=closed
                           Click Element                                id=closed

                           Close Browser


*** Test Cases ***
PA Preset Form
                           Start

                           Wait Until Element Is Visible                id=configurationMenu
                           Click Button                                 id=configurationMenu
                           sleep                                        1
                           Wait Until Element Is Visible                id=environmentMenu
                           Click Button                                 id=environmentMenu
                           sleep                                        1
                           Wait Until Element Is Visible                id=addPresetMenu
                           Click Button                                 id=addPresetMenu
                           sleep                                        1
                           Wait Until Element Is Visible                id=paMenu
                           Click Button                                 id=paMenu
                           sleep                                        1

                           Wait Until Element Is Visible                id=btnsave
                           Click Button                                 id=btnsave
                           Wait Until Element Is Visible                id=numberRequired
                           ${present}=                                  Run Keyword And Return Status    Element Should Be Visible                  id=numberRequired
                           Should Be True                               ${present} == ${True}
                           ${present}=                                  Run Keyword And Return Status    Element Should Be Visible                  id=descriptionRequired
                           Should Be True                               ${present} == ${True}
                           ${present}=                                  Run Keyword And Return Status    Element Should Be Visible                  id=environmentNameRequired
                           Should Be True                               ${present} == ${True}


                           Wait Until Element Is Visible                id=number
                           Input Text                                   id=number                        test1
                           Input Text                                   id=description                   test1
                           Wait Until Element Is Visible                id=environmentList
                           Click Element                                id=environmentList
                           Wait Until Element Is Visible                id=environmentOption
                           Click Element                                id=environmentOption
                           Click Button                                 id=btnsave
                           Wait Until Element Is Visible                id=responseMessage
                           ${createResponse}=                           Get Text                         id=responseMessage
                           Should Be Equal As Strings                   ${createResponse}                PA Preset Created successfully
                           Log To Console                               ${createResponse}
                           Wait Until Element Is Visible                id=closed
                           Click Element                                id=closed

                           Wait Until Element Is Visible                id=test1
                           Click Element                                id=test1
                           Wait Until Element Is Visible                id=btnreset
                           Click Button                                 id=btnreset

                           Wait Until Element Is Visible                id=test1
                           Click Element                                id=test1
                           Sleep                                        1
                           ${description}                               Get Value                        id=description
                           Wait Until Element Is Visible                id=description
                           Clear Element Text                           id=description
                           Sleep                                        1
                           Input Text                                   id=description                   test description
                           Click Button                                 id=btnsave
                           Wait Until Element Is Visible                id=responseMessage
                           ${updateResponse}=                           Get Text                         id=responseMessage
                           Should Be Equal As Strings                   ${updateResponse}                PA Preset updated successfully
                           Wait Until Element Is Visible                id=closed
                           Click Element                                id=closed

                           Wait Until Element Is Visible                id=test1
                           Click Element                                id=test1
                           Sleep                                        1
                           ${updateDescription}                         Get Value                        id=description
                           Should Be Equal As Strings                   ${updateDescription}             test description
                           Click Button                                 id=btnreset

                           Wait Until Element Is Visible                id=test1
                           Click Element                                id=test1
                           Wait Until Element Is Visible                id=description
                           Clear Element Text                           id=description
                           Sleep                                        1
                           Input Text                                   id=description                   ${description}
                           Click Button                                 id=btnsave
                           Wait Until Element Is Visible                id=responseMessage
                           ${updateResponse}=                           Get Text                         id=responseMessage
                           Should Be Equal As Strings                   ${updateResponse}                PA Preset updated successfully
                           Wait Until Element Is Visible                id=closed
                           Click Element                                id=closed

                           Wait Until Element Is Visible                id=number
                           Input Text                                   id=number                        test1
                           Input Text                                   id=description                   test1
                           Wait Until Element Is Visible                id=environmentList
                           Click Element                                id=environmentList
                           Wait Until Element Is Visible                id=environmentOption
                           Click Element                                id=environmentOption
                           Click Button                                 id=btnsave
                           Wait Until Element Is Visible                id=responseMessage
                           ${existResponse}=                            Get Text                         id=responseMessage
                           Should Be Equal As Strings                   ${existResponse}                 PA number Already Exist
                           Log To Console                               ${existResponse}
                           Wait Until Element Is Visible                id=closed
                           Click Element                                id=closed


                           Wait Until Element Is Visible                id=test1
                           Click Element                                id=test1
                           Wait Until Element Is Visible                id=delete
                           Click Button                                 id=delete
                           Wait Until Element Is Visible                id=confirmDelete
                           Click Button                                 id=confirmDelete
                           Wait Until Element Is Visible                id=responseMessage
                           ${deleteResponse}=                           Get Text                         id=responseMessage
                           Should Be Equal As Strings                   ${deleteResponse}                PA Preset Deleted successfully
                           Wait Until Element Is Visible                id=closed
                           Click Element                                id=closed

                           Close Browser
