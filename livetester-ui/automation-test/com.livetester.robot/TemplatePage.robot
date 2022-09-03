*** Settings ***
Library                      Selenium2Library

*** Variable ***
${URL}                       http://localhost:4200/login
${Browser}                   googlechrome

*** Keywords ***
Start
                             Open browser                                 http://localhost:4200               chrome
                             Maximize Browser Window



CreateTemplateInfo
                             Start
                             Wait Until Element Is Visible                id=login
                             Click Button                                 id=login
                             ${present}=                                  Run Keyword And Return Status       Element Should Be Visible                  id=usernameRequired
                             Should Be True                               ${present} == ${True}
                             ${present}=                                  Run Keyword And Return Status       Element Should Be Visible                  id=passwordRequired
                             Should Be True                               ${present} == ${True}
                             #Login with correct username and Password
                             Wait Until Element Is Visible                id=username
                             Click Element                                id=username
                             Input Text                                   id=username                         bob@test.com
                             Wait Until Element Is Visible                id=password
                             Click Element                                id=password
                             Input Text                                   id=password                         123qwe
                             Wait Until Element Is Visible                id=login
                             Click Button                                 id=login

                             Wait Until Element Is Visible                id=templateMenu
                             Click Button                                 id=templateMenu
                             sleep                                        1
                             Wait Until Element Is Visible                id=createTemplate
                             Click Button                                 id=createTemplate


                             #Create Dulicate
                             Wait Until Element Is Visible                id=templateMenu
                             Click Button                                 id=templateMenu
                             sleep                                        1
                             Wait Until Element Is Visible                id=listTemplate
                             Click Button                                 id=listTemplate
                             Wait Until Element Is Visible                id=templateNameList
                             Click Element                                id=templateNameList
                             Wait Until Element Is Visible                id=templateOption
                             Click Element                                id=templateOption
                             Wait Until Element Is Visible                id=duplicateButton
                             Click Element                                id=duplicateButton
                             Wait Until Element Is Visible                id=templateName
                             Click Element                                id=templateName
                             Input Text                                   id=templateName                     Duplicte Template
                             Wait Until Element Is Visible                id=saveDupBtn
                             Click Button                                 id=saveDupBtn
                             Wait Until Element Is Visible                id=responseMessage
                             ${createdupeResponse}=                       Get Text                            id=responseMessage
                             Should Be Equal As Strings                   ${createdupeResponse}               Duplicate Template Created Successfully
                             Wait Until Element Is Visible                id=closed
                             Click Element                                id=closed

                             #deleteDuplicate
                             Wait Until Element Is Visible                id=templateMenu
                             Click Button                                 id=templateMenu
                             sleep                                        1
                             Wait Until Element Is Visible                id=listTemplate
                             Click Button                                 id=listTemplate
                             Wait Until Element Is Visible                id=templateNameList
                             Click Element                                id=templateNameList
                             Wait Until Element Is Visible                id=templateOption
                             Click Element                                id=templateOption
                             Wait Until Element Is Visible                id=deleteButton
                             Click Element                                id=deleteButton
                             Wait Until Element Is Visible                id=responseMessage
                             ${deletedupeResponse}=                       Get Text                            id=responseMessage
                             Wait Until Element Is Visible                id=closed
                             Click Element                                id=closedF

                             Wait Until Element Is Visible                id=templateName
                             Input Text                                   id=templateName                     test
                             Wait Until Element Is Visible                id=claimSubmitter
                             Click Element                                id=claimSubmitter
                             Wait Until Element Is Visible                id=claimSubmittersOption
                             Click Element                                id=claimSubmittersOption
                             Wait Until Element Is Visible                id=claimReceiver
                             Click Element                                id=claimReceiver
                             Wait Until Element Is Visible                id=claimReceiverOption
                             Click Element                                id=claimReceiverOption
                             Wait Until Element Is Visible                id=formType
                             Click Element                                id=formType
UpdateDeleteInfo
                             Wait Until Element Is Visible                id=claimType
                             Click Element                                id=claimType
                             Wait Until Element Is Visible                id=claimTypeOption
                             Click Element                                id=claimTypeOption

                             Input Text                                   id=identifier                       test
                             Input Text                                   id=firstName                        test
                             Input Text                                   id=lastName                         test
                             Input Text                                   id=dob                              5
                             Wait Until Element Is Visible                id=gender
                             Click Element                                id=gender
                             Wait Until Element Is Visible                id=male
                             Click Element                                id=male
                             Input Text                                   id=address                          test
                             Input Text                                   id=city                             test
                             Input Text                                   id=state                            test
                             Input Text                                   id=zipcode                          test

                             Input Text                                   id=npi                              test
                             Input Text                                   id=taxonomy                         test
                             Input Text                                   id=billingFirstName                 test
                             Input Text                                   id=billingLastName                  test
                             Input Text                                   id=organizationName                 test
                             Input Text                                   id=taxId                            test
                             Wait Until Element Is Visible                id=type
                             Click Element                                id=type
                             Wait Until Element Is Visible                id=individual
                             Click Element                                id=individual
                             Input Text                                   id=billingAddress                   test
                             Input Text                                   id=billingCity                      test
                             Input Text                                   id=billingState                     test
                             Input Text                                   id=billingZipcode                   test

                             Input Text                                   id=payorIdentifier                  test
                             Input Text                                   id=payorName                        test
                             Input Text                                   id=payorAddress                     test
                             Input Text                                   id=payorCity                        test
                             Input Text                                   id=payorState                       test
                             Input Text                                   id=payorZipcode                     test

                             Input Text                                   id=billedAmount                     123
                             Input Text                                   id=billedUnits                      123
                             Input Text                                   id=claimHeaderFromDate              5
                             Input Text                                   id=claimHeaderToDate                7
                             Wait Until Element Is Visible                id=frequency
                             Click Element                                id=frequency
                             Wait Until Element Is Visible                id=frequencyOption
                             Click Element                                id=frequencyOption
                             Wait Until Element Is Visible                id=source
                             Click Element                                id=source
                             Wait Until Element Is Visible                id=sourceOption
                             Click Element                                id=sourceOption
                             Input Text                                   id=patientControlNo                 test
                             Input Text                                   id=facilityType                     test
                             Input Text                                   id=serviceFacility                  test
                             Input Text                                   id=primaryDiagnosis                 test
                             Input Text                                   id=secondryDiagnosisList            test
                             Input Text                                   id=paidAmount                       123
                             Input Text                                   id=allowedAmount                    123
                             Input Text                                   id=paidUnits                        123
                             Wait Until Element Is Visible                id=expectedClaimType
                             Click Element                                id=expectedClaimType
                             Wait Until Element Is Visible                id=expectedClaimTypeOption
                             Click Element                                id=expectedClaimTypeOption

                             Input Text                                   id=fromDate                         5
                             Input Text                                   id=toDate                           7
                             Input Text                                   id=servicingNpi                     test
                             Input Text                                   id=servicingTaxonomy                test
                             Input Text                                   id=servicingRevenueCode             test
                             Input Text                                   id=servicingProcedureCode           test
                             Input Text                                   id=modifiersList                    test
                             Wait Until Element Is Visible                id=diagnosisCode
                             Click Element                                id=diagnosisCode
                             Wait Until Element Is Visible                id=diagnosisCodeOption
                             Click Element                                id=diagnosisCodeOption
                             Input Text                                   id=serviceLineBilledAmount          123
                             Input Text                                   id=serviceLineBilledUnits           123
                             Input Text                                   id=serviceFacility                  123
                             Input Text                                   id=serviceLinePaidAmount            123
                             Input Text                                   id=serviceLineAllowedAmount         123
                             Input Text                                   id=serviceLineAllowedUnits          123
                             Input Text                                   id=serviceLinePaidUnits             123

                             Wait Until Element Is Visible                id=save
                             Click Button                                 id=save
                             Wait Until Element Is Visible                id=responseMessage
                             ${createResponse}=                           Get Text                            id=responseMessage
                             Should Be Equal As Strings                   ${createResponse}                   Template created successfully
                             Wait Until Element Is Visible                id=closed
                             Click Element                                id=closed



#Update
                             Wait Until Element Is Visible                id=templateMenu
                             Click Button                                 id=templateMenu
                             sleep                                        1
                             Wait Until Element Is Visible                id=listTemplate
                             Click Button                                 id=listTemplate
                             Wait Until Element Is Visible                id=templateNameList
                             Click Element                                id=templateNameList
                             Wait Until Element Is Visible                id=templateOption
                             Click Element                                id=templateOption
                             Wait Until Element Is Visible                id=editButton
                             Click Element                                id=editButton
                             sleep                                        1
                             Wait Until Element Is Visible                id=state
                             Clear Element Text                           id=state
                             Input Text                                   id=state                            test123
                             Wait Until Element Is Visible                id=formType
                             Wait Until Element Is Visible                id=formType
                             ${formType}=                                 Get Value                           id=formType
                             Log To Console                               ${formType}
                             Run Keyword If                               '${formType}' == 'Institutional'    UpdateInstitutionalClaims
                             Run Keyword If                               '${formType}' == 'Dental'           UpdateDentalClaims
                             Wait Until Element Is Visible                id=save
                             Click Button                                 id=save

                             Wait Until Element Is Visible                id=responseMessage
                             ${updateResponse}=                           Get Text                            id=responseMessage
                             Should Be Equal As Strings                   ${updateResponse}                   Template updated successfully
                             Wait Until Element Is Visible                id=closed
                             Click Element                                id=closed

                             Wait Until Element Is Visible                id=deleteButton
                             Click Element                                id=deleteButton
                             Wait Until Element Is Visible                id=confirmDelete
                             Click Button                                 id=confirmDelete
                             Wait Until Element Is Visible                id=responseMessage
                             ${deleteResponse}=                           Get Text                            id=responseMessage
                             Should Be Equal As Strings                   ${deleteResponse}                   Template deleted Successfully
                             Wait Until Element Is Visible                id=closed
                             Click Element                                id=closed
                             Close Browser

UpdateInstitutionalClaims
                             Clear Element Text                           id=surgicalCode
                             Input Text                                   id=surgicalCode                     2A
                             Input Text                                   id=surgicalDate                     5
                             Clear Element Text                           id=occuranceCode
                             Input Text                                   id=occuranceCode                    55
                             Input Text                                   id=occuranceDate                    5
                             Clear Element Text                           id=occuranceSpanCode
                             Input Text                                   id=occuranceSpanCode                1S
                             Input Text                                   id=occuranceSpanDate                5
                             Clear Element Text                           id=valueCode
                             Input Text                                   id=valueCode                        66
                             Input Text                                   id=valueAmount                      545
UpdateDentalClaims
                             Input Text                                   id=toothNumber                      22
                             Input Text                                   id=toothStatus                      Done
                             Wait Until Element Is Visible                id=toothCodes
                             Input Text                                   id=toothCodes                       GG
                             Input Text                                   id=oralCavityDesignationCodes       HH


*** Test Cases ***
Template Form
                             CreateTemplateInfo
                             Wait Until Element Is Visible                id=Institutional
                             Click Element                                id=Institutional


                             Input Text                                   id=surgicalCode                     1A
                             Input Text                                   id=occuranceCode                    1o
                             Input Text                                   id=occuranceSpanCode                1S
                             Input Text                                   id=valueCode                        65
                             Wait Until Element Is Visible                id=save
                             Click Button                                 id=save
                             ${present}=                                  Run Keyword And Return Status       Element Should Be Visible                  id=surgicalDateRequired
                             Should Be True                               ${present} == ${True}


                             ${present}=                                  Run Keyword And Return Status       Element Should Be Visible                  id=occuranceDateRequired
                             Should Be True                               ${present} == ${True}


                             ${present}=                                  Run Keyword And Return Status       Element Should Be Visible                  id=occuranceSpanDateRequired
                             Should Be True                               ${present} == ${True}


                             ${present}=                                  Run Keyword And Return Status       Element Should Be Visible                  id=valueAmountRequired
                             Should Be True                               ${present} == ${True}
                             Input Text                                   id=surgicalDate                     5
                             Input Text                                   id=occuranceDate                    5
                             Input Text                                   id=occuranceSpanDate                5
                             Input Text                                   id=valueAmount                      545
                             Input Text                                   id=conditionCodes                   SS
                             Input Text                                   id=treatmentCodes                   SS
                             UpdateDeleteInfo
                             CreateTemplateInfo
                             Wait Until Element Is Visible                id=Dental
                             Click Element                                id=Dental
                             Input Text                                   id=toothNumber                      1A
                             Click Button                                 id=save
                             ${present}=                                  Run Keyword And Return Status       Element Should Be Visible                  id=statusRequired
                             Should Be True                               ${present} == ${True}
                             Input Text                                   id=toothStatus                      removed
                             Wait Until Element Is Visible                id=toothCodes
                             Input Text                                   id=toothCodes                       AA
                             Input Text                                   id=oralCavityDesignationCodes       BB
                             UpdateDeleteInfo
                             Close Browser



