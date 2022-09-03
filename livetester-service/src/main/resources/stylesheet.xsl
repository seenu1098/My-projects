<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:fo="http://www.w3.org/1999/XSL/Format"
	exclude-result-prefixes="fo">

	<xsl:template match="test">
		<fo:root xmlns:fo="http://www.w3.org/1999/XSL/Format">
			<fo:layout-master-set>
				<fo:simple-page-master master-name="simpleA4"
					page-height="29.7cm" page-width="21cm" margin-top="2cm"
					margin-bottom="2cm" margin-left="2cm" margin-right="2cm">
					<fo:region-body region-name="xsl-region-body"
						margin-bottom=".5in" margin-top=".50in" />
					<fo:region-before region-name="xsl-region-before"
						extent="5in" />
					<fo:region-after region-name="xsl-region-after"
						extent=".30in" />
				</fo:simple-page-master>
			</fo:layout-master-set>
			<fo:page-sequence master-reference="simpleA4">
				<fo:static-content flow-name="xsl-region-before">
					<fo:block>
						<fo:inline font-weight="bold">
							Batch Name:&#160;
							<xsl:value-of select="batch_name" />
						</fo:inline>
					</fo:block>
				</fo:static-content>
				<fo:static-content flow-name="xsl-region-after">
					<fo:block margin-top="10%" width="110%">
						Generated on:
						<xsl:value-of select="generated_date" />
						<fo:leader leader-length="40mm" />
						<xsl:text>Powered by Yorosis Technologies Inc</xsl:text>
					</fo:block>
				</fo:static-content>
				<fo:flow flow-name="xsl-region-body">
					<xsl:apply-templates select="testcase" />
				</fo:flow>


			</fo:page-sequence>
		</fo:root>

	</xsl:template>

	<xsl:template match="testcase">
		<fo:block>
			<fo:inline font-size="12pt" space-after="3mm">
				<fo:inline font-weight="bold">Testcase Name:&#160; </fo:inline>
				<xsl:value-of select="testcase_name" />&#160;
			</fo:inline>
		</fo:block>
		<fo:block font-size="12pt" space-after="3mm">
			<fo:inline font-weight="bold">Test Scenario:&#160; </fo:inline>
			<xsl:value-of select="testScenario" />
			&#160;
		</fo:block>
		<fo:block font-size="12pt" space-after="3mm">
			<fo:inline font-weight="bold">Test Result:&#160; </fo:inline>
			<xsl:value-of select="test_result" />
			&#160;
		</fo:block>
		<fo:block space-after="3mm">
			<fo:leader leader-pattern="rule" leader-length="100%"
				rule-style="solid" rule-thickness="2pt" />
		</fo:block>


		<fo:block font-size="12pt" space-after="3mm">
			<fo:inline font-weight="bold"> Submitter:&#160;</fo:inline>
			<xsl:value-of select="claimSubmitters" />
			<fo:inline font-weight="bold">
				<fo:leader leader-length="5mm" />
				Receiver:&#160;
			</fo:inline>
			<xsl:value-of select="claimReceiver" />
			<fo:inline font-weight="bold">
				<fo:leader leader-length="5mm" />
				Form Type:&#160;
			</fo:inline>
			<xsl:value-of select="formType" />
		</fo:block>
		<fo:block>
			<fo:leader leader-pattern="rule" leader-length="100%"
				rule-style="solid" rule-thickness="2pt" />
		</fo:block>
		<fo:block font-size="12pt" space-after="3mm">
			<fo:block space-after="3mm">
				<fo:inline font-weight="bold">Subscriber:&#160; </fo:inline>
			</fo:block>

			<fo:table table-layout="fixed" width="100%"
				border-collapse="separate" border-spacing="5pt 10pt">
				<fo:table-column column-width="33%" />
				<fo:table-column column-width="33%" />
				<fo:table-column column-width="33%" />

				<fo:table-body>

					<xsl:apply-templates select="subscriber" />
				</fo:table-body>
			</fo:table>
		</fo:block>
		<fo:block>
			<fo:leader leader-pattern="rule" leader-length="100%"
				rule-style="solid" rule-thickness="2pt" />
		</fo:block>
		<fo:block font-size="12pt" space-after="3mm">
			<fo:block space-after="3mm">
				<fo:inline font-weight="bold">Beneficiary:&#160; </fo:inline>
			</fo:block>
			<fo:table table-layout="fixed" width="100%"
				border-collapse="separate" border-spacing="5pt 10pt">
				<fo:table-column column-width="33%" />
				<fo:table-column column-width="33%" />
				<fo:table-column column-width="33%" />

				<fo:table-body>

					<xsl:apply-templates select="beneficiary" />
				</fo:table-body>
			</fo:table>
		</fo:block>
		<fo:block>
			<fo:leader leader-pattern="rule" leader-length="100%"
				rule-style="solid" rule-thickness="2pt" />
		</fo:block>


		<fo:block font-size="12pt" space-after="3mm">
			<fo:block space-after="3mm">
				<fo:inline font-weight="bold">Billing Provider Details:&#160; </fo:inline>
			</fo:block>
			<fo:table table-layout="fixed" width="100%"
				border-collapse="separate" border-spacing="5pt 10pt">
				<fo:table-column column-width="33%" />
				<fo:table-column column-width="33%" />
				<fo:table-column column-width="33%" />

				<fo:table-body>

					<xsl:apply-templates select="billing" />
				</fo:table-body>
			</fo:table>
		</fo:block>
		<fo:block>
			<fo:leader leader-pattern="rule" leader-length="100%"
				rule-style="solid" rule-thickness="2pt" />
		</fo:block>

		<fo:block font-size="12pt" space-after="3mm">
			<fo:block space-after="3mm">
				<fo:inline font-weight="bold">Servicing Provider Details:&#160; </fo:inline>
			</fo:block>
			<fo:table table-layout="fixed" width="100%"
				border-collapse="separate" border-spacing="5pt 10pt">
				<fo:table-column column-width="33%" />
				<fo:table-column column-width="33%" />
				<fo:table-column column-width="33%" />

				<fo:table-body>

					<xsl:apply-templates select="servicing"
						mode="servicing" />
				</fo:table-body>
			</fo:table>
		</fo:block>
		<fo:block>
			<fo:leader leader-pattern="rule" leader-length="100%"
				rule-style="solid" rule-thickness="2pt" />
		</fo:block>

		<fo:block font-size="12pt" space-after="3mm">
			<fo:block space-after="3mm">
				<fo:inline font-weight="bold">Payor Details:&#160; </fo:inline>
			</fo:block>
			<fo:table table-layout="fixed" width="100%"
				border-collapse="separate" border-spacing="5pt 10pt">
				<fo:table-column column-width="33%" />
				<fo:table-column column-width="33%" />
				<fo:table-column column-width="33%" />

				<fo:table-body>

					<xsl:apply-templates select="payor" />
				</fo:table-body>
			</fo:table>
		</fo:block>
		<fo:block>
			<fo:leader leader-pattern="rule" leader-length="100%"
				rule-style="solid" rule-thickness="2pt" />
		</fo:block>

		<fo:block font-size="12pt" space-after="3mm">
			<fo:block space-after="3mm">
				<fo:inline font-weight="bold">Claim Header:&#160; </fo:inline>
			</fo:block>
			<fo:table table-layout="fixed" width="100%"
				border-collapse="separate" border-spacing="1pt 10pt">
				<fo:table-column column-width="33%" />
				<fo:table-column column-width="33%" />
				<fo:table-column column-width="33%" />

				<fo:table-body>

					<xsl:apply-templates select="claimHeader" />
				</fo:table-body>
			</fo:table>

		</fo:block>
		<fo:block>
			<fo:leader leader-pattern="rule" leader-length="100%"
				rule-style="solid" rule-thickness="2pt" />
		</fo:block>


		<fo:block font-size="12pt" space-after="3mm">
			<fo:table table-layout="fixed" width="100%"
				border-collapse="separate" border-spacing="5pt 10pt">
				<fo:table-column column-width="33%" />
				<fo:table-column column-width="33%" />
				<fo:table-column column-width="33%" />

				<fo:table-body>

					<xsl:apply-templates select="services" />
				</fo:table-body>
			</fo:table>
		</fo:block>

	</xsl:template>
	<xsl:template match="subscriber">

		<fo:table-row>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600">Identifier:&#160;</fo:inline>

					<xsl:value-of select="identifier" />

				</fo:block>

			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> First Name:&#160;</fo:inline>

					<xsl:value-of select="firstName" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Last Name:&#160;</fo:inline>
					<xsl:value-of select="lastName" />
				</fo:block>
			</fo:table-cell>

		</fo:table-row>

		<fo:table-row>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Date Of Birth:&#160;</fo:inline>
					<xsl:value-of select="dob" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Gender:&#160;</fo:inline>
					<xsl:value-of select="gender" />
				</fo:block>
			</fo:table-cell>
		</fo:table-row>



		<xsl:apply-templates select="address" />
	</xsl:template>

	<xsl:template match="address" priority="1">
		<fo:table-row>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Address:&#160;</fo:inline>
					<xsl:value-of select="address" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600">City:&#160;</fo:inline>

					<xsl:value-of select="city" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> State:&#160;</fo:inline>
					<xsl:value-of select="state" />
				</fo:block>
			</fo:table-cell>

		</fo:table-row>

		<fo:table-row>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Zipcode:&#160;</fo:inline>
					<xsl:value-of select="zipcode" />
				</fo:block>
			</fo:table-cell>
		</fo:table-row>

	</xsl:template>

	<xsl:template match="beneficiary">

		<fo:table-row>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Identifier:&#160;</fo:inline>
					<xsl:value-of select="identifier" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> First Name:&#160;</fo:inline>

					<xsl:value-of select="firstName" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Last Name: &#160;</fo:inline>
					<xsl:value-of select="lastName" />
				</fo:block>
			</fo:table-cell>

		</fo:table-row>

		<fo:table-row>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Date Of Birth: &#160;</fo:inline>
					<xsl:value-of select="dob" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Gender: &#160;</fo:inline>
					<xsl:value-of select="gender" />
				</fo:block>
			</fo:table-cell>
		</fo:table-row>



		<xsl:apply-templates select="address" />
	</xsl:template>

	<xsl:template match="address" priority="2">
		<fo:table-row>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Address:&#160;</fo:inline>
					<xsl:value-of select="address" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600">City:&#160;</fo:inline>

					<xsl:value-of select="city" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> State:&#160;</fo:inline>
					<xsl:value-of select="state" />
				</fo:block>
			</fo:table-cell>

		</fo:table-row>

		<fo:table-row>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Zipcode:&#160;</fo:inline>
					<xsl:value-of select="zipcode" />
				</fo:block>
			</fo:table-cell>
		</fo:table-row>

	</xsl:template>

	<xsl:template match="billing">

		<fo:table-row>

			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Identifier:&#160;</fo:inline>
					<xsl:value-of select="npi" />
				</fo:block>
			</fo:table-cell>


			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Taxonomy:&#160;</fo:inline>
					<xsl:value-of select="taxonomy" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> First Name: &#160;</fo:inline>

					<xsl:value-of select="firstName" />
				</fo:block>
			</fo:table-cell>


		</fo:table-row>

		<fo:table-row>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Last Name:&#160;</fo:inline>
					<xsl:value-of select="lastName" />
				</fo:block>
			</fo:table-cell>

			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Organization Name:&#160; </fo:inline>
					<xsl:value-of select="organizationName" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> SSN / EIN:&#160;</fo:inline>
					<xsl:value-of select="taxId" />
				</fo:block>
			</fo:table-cell>

		</fo:table-row>
		<fo:table-row>

			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Type:&#160;</fo:inline>
					<xsl:value-of select="type" />
				</fo:block>
			</fo:table-cell>
		</fo:table-row>

		<xsl:apply-templates select="address" />
	</xsl:template>


	<xsl:template match="address" priority="3">
		<fo:table-row>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Address:&#160;</fo:inline>
					<xsl:value-of select="address" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600">City:&#160;</fo:inline>

					<xsl:value-of select="city" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> State:&#160;</fo:inline>
					<xsl:value-of select="state" />
				</fo:block>
			</fo:table-cell>

		</fo:table-row>

		<fo:table-row>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Zipcode:&#160;</fo:inline>
					<xsl:value-of select="zipcode" />
				</fo:block>
			</fo:table-cell>
		</fo:table-row>

	</xsl:template>

	<xsl:template match="servicing" priority="2"
		mode="servicing">

		<fo:table-row>

			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600">Identifier:&#160;</fo:inline>
					<xsl:value-of select="npi" />
				</fo:block>
			</fo:table-cell>



			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600">Taxonomy:&#160;</fo:inline>
					<xsl:value-of select="taxonomy" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600">First Name:&#160;</fo:inline>

					<xsl:value-of select="firstName" />
				</fo:block>
			</fo:table-cell>


		</fo:table-row>

		<fo:table-row>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Last Name:&#160;</fo:inline>
					<xsl:value-of select="lastName" />
				</fo:block>
			</fo:table-cell>

			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Organization Name:&#160; </fo:inline>
					<xsl:value-of select="organizationName" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> SSN / EIN:&#160;</fo:inline>
					<xsl:value-of select="taxId" />
				</fo:block>
			</fo:table-cell>

		</fo:table-row>
		<fo:table-row>

			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Type:&#160;</fo:inline>
					<xsl:value-of select="type" />
				</fo:block>
			</fo:table-cell>
		</fo:table-row>


		<xsl:apply-templates select="address" />
	</xsl:template>




	<xsl:template match="address" priority="4">
		<fo:table-row>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Address:&#160;</fo:inline>
					<xsl:value-of select="address" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600">City:&#160;</fo:inline>

					<xsl:value-of select="city" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> State:&#160;</fo:inline>
					<xsl:value-of select="state" />
				</fo:block>
			</fo:table-cell>

		</fo:table-row>

		<fo:table-row>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Zipcode:&#160;</fo:inline>
					<xsl:value-of select="zipcode" />
				</fo:block>
			</fo:table-cell>
		</fo:table-row>

	</xsl:template>

	<xsl:template match="payor">

		<fo:table-row>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Payor Identifier:&#160; </fo:inline>
					<xsl:value-of select="identifier" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Payor Name:&#160;</fo:inline>

					<xsl:value-of select="name" />
				</fo:block>
			</fo:table-cell>


		</fo:table-row>


		<xsl:apply-templates select="address" />
	</xsl:template>

	<xsl:template match="address" priority="5">
		<fo:table-row>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Address:&#160;</fo:inline>
					<xsl:value-of select="address" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600">City:&#160;</fo:inline>

					<xsl:value-of select="city" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> State:&#160;</fo:inline>
					<xsl:value-of select="state" />
				</fo:block>
			</fo:table-cell>

		</fo:table-row>

		<fo:table-row>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Zipcode:&#160;</fo:inline>
					<xsl:value-of select="zipcode" />
				</fo:block>
			</fo:table-cell>
		</fo:table-row>

	</xsl:template>
	<xsl:template match="claimHeader">

		<fo:table-row>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Billed Amount:</fo:inline>
					<xsl:value-of select="billedAmount" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Billed Units:</fo:inline>

					<xsl:value-of select="billedUnits" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> From Date:</fo:inline>
					<xsl:value-of select="fromDate" />
				</fo:block>
			</fo:table-cell>

		</fo:table-row>

		<fo:table-row>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> To Date:</fo:inline>
					<xsl:value-of select="toDate" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Frequency:</fo:inline>
					<xsl:value-of select="frequency" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Source:</fo:inline>
					<xsl:value-of select="source" />
				</fo:block>
			</fo:table-cell>
		</fo:table-row>

		<fo:table-row>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600">Patient Control Number:
					</fo:inline>
					<xsl:value-of select="patientControlNo" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Facility Type:</fo:inline>
					<xsl:value-of select="facilityType" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Prior Auth 1:</fo:inline>
					<xsl:value-of select="priorAuth1" />
				</fo:block>
			</fo:table-cell>
		</fo:table-row>

		<fo:table-row>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600">Prior Auth 2:</fo:inline>
					<xsl:value-of select="priorAuth2" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600">Primary Diagnosis:</fo:inline>

					<xsl:value-of select="primaryDiagnosis" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600">Secondary Diagnosis:</fo:inline>

					<xsl:for-each select="secondaryDiagnosisList">
						<xsl:value-of select="." />
						,
					</xsl:for-each>
				</fo:block>
			</fo:table-cell>
		</fo:table-row>
		
		<xsl:call-template name="createServiceFacility" />
		
		<fo:table-row>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="bold"> Tooth Status:</fo:inline>
				</fo:block>
			</fo:table-cell>
		</fo:table-row>
		<xsl:apply-templates select="dental" mode="claimHeaderDental" />
		
		<xsl:call-template name="createExpectedElement" />

	</xsl:template>
	
	<xsl:template name="createServiceFacility">
		<fo:table-row background-color="#c2d1f2">
			<fo:table-cell number-columns-spanned="3">
				<fo:block-container>
					<fo:table table-layout="fixed" width="100%" border-collapse="separate" border-spacing="5pt 10pt">
						<fo:table-column column-width="33%" />
						<fo:table-column column-width="33%" />
						<fo:table-column column-width="33%" />
		
						<fo:table-body>
							<xsl:apply-templates select="serviceFacility" />
						</fo:table-body>
					</fo:table>
				</fo:block-container>
			</fo:table-cell>
		</fo:table-row>
	</xsl:template>
	
	<xsl:template name="createExpectedElement">
		<fo:table-row>
			<fo:table-cell>
				<fo:block page-break-before="always"></fo:block>
			</fo:table-cell>
		</fo:table-row>
		
		<fo:table-row background-color="#b2f7b0" number-rows-spanned="5">
			<fo:table-cell number-columns-spanned="3">
				<fo:block-container>
					<fo:table table-layout="fixed" width="100%" border-collapse="separate" border-spacing="5pt 10pt">
						<fo:table-column column-width="16%" />
						<fo:table-column column-width="30%" />
						<fo:table-column column-width="20%" />
						<fo:table-column column-width="20%" />
						<fo:table-column column-width="14%" />
		
						<fo:table-body>
							<fo:table-row>
								<fo:table-cell number-columns-spanned="5">
									<fo:block>
										<fo:inline font-weight="bold">Expected Results:</fo:inline>
									</fo:block>
								</fo:table-cell>
							</fo:table-row>
							<fo:table-row>
								<fo:table-cell>
									<fo:block>
										<fo:inline font-weight="bold">Applicable at</fo:inline>
									</fo:block>
								</fo:table-cell>
								<fo:table-cell>
									<fo:block>
										<fo:inline font-weight="bold">Element Name</fo:inline>
									</fo:block>
								</fo:table-cell>
								<fo:table-cell>
									<fo:block>
										<fo:inline font-weight="bold">Expected</fo:inline>
									</fo:block>
								</fo:table-cell>
								<fo:table-cell>
									<fo:block>
										<fo:inline font-weight="bold">Actual</fo:inline>
									</fo:block>
								</fo:table-cell>
								<fo:table-cell>
									<fo:block>
										<fo:inline font-weight="bold">Status</fo:inline>
									</fo:block>
								</fo:table-cell>
							</fo:table-row>
							<xsl:apply-templates select="expectedResult/result" />
						</fo:table-body>
					</fo:table>
				</fo:block-container>
			</fo:table-cell>
		</fo:table-row>
	</xsl:template>

	<xsl:template match="serviceFacility" priority="1">
	
		<fo:table-row>
			<fo:table-cell number-columns-spanned="3">
				<fo:block>
						<fo:inline font-weight="bold">Service Facility:</fo:inline>
				</fo:block>
			</fo:table-cell>
		</fo:table-row>
		
		<fo:table-row>

			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Identifier:&#160;</fo:inline>
					<xsl:value-of select="npi" />
				</fo:block>
			</fo:table-cell>


			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Taxonomy:&#160;</fo:inline>
					<xsl:value-of select="taxonomy" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> First Name: &#160;</fo:inline>

					<xsl:value-of select="firstName" />
				</fo:block>
			</fo:table-cell>


		</fo:table-row>

		<fo:table-row>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Last Name:&#160;</fo:inline>
					<xsl:value-of select="lastName" />
				</fo:block>
			</fo:table-cell>

			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Organization Name:&#160; </fo:inline>
					<xsl:value-of select="organizationName" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> SSN / EIN:&#160;</fo:inline>
					<xsl:value-of select="taxId" />
				</fo:block>
			</fo:table-cell>

		</fo:table-row>
		<fo:table-row>

			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Type:&#160;</fo:inline>
					<xsl:value-of select="type" />
				</fo:block>
			</fo:table-cell>
		</fo:table-row>

		<xsl:apply-templates select="address" />

	</xsl:template>

	<xsl:template match="address" priority="6">
		<fo:table-row>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Address:&#160;</fo:inline>
					<xsl:value-of select="address" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600">City:&#160;</fo:inline>

					<xsl:value-of select="city" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> State:&#160;</fo:inline>
					<xsl:value-of select="state" />
				</fo:block>
			</fo:table-cell>

		</fo:table-row>

		<fo:table-row>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Zipcode:&#160;</fo:inline>
					<xsl:value-of select="zipcode" />
				</fo:block>
			</fo:table-cell>
		</fo:table-row>

	</xsl:template>

	<xsl:template match="dental" priority="1"
		mode="claimHeaderDental">
		<xsl:apply-templates select="toothStatusList" />

	</xsl:template>

	<xsl:template match="toothStatusList">
		<fo:table-row>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Tooth Number:</fo:inline>
					<xsl:value-of select="toothNumber" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600">Tooth Status:</fo:inline>
					<xsl:value-of select="toothStatus" />
				</fo:block>
			</fo:table-cell>
		</fo:table-row>
	</xsl:template>

	<xsl:template match="expectedResult/result " priority="1">
		<fo:table-row>
			<fo:table-cell>
				<fo:block>
					<xsl:value-of select="applicableAt" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<xsl:value-of select="elementName" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<xsl:value-of select="expectedValue" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<xsl:value-of select="actualValue" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<xsl:value-of select="status" />
				</fo:block>
			</fo:table-cell>
		</fo:table-row>
	</xsl:template>

	<xsl:template match="services">
		<fo:table-row>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="bold"> Service Line: </fo:inline>
					<xsl:value-of select="internal/lineSequenceNo" />
				</fo:block>
			</fo:table-cell>
		</fo:table-row>
		<fo:table-row>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> From Date:</fo:inline>
					<xsl:value-of select="fromDate" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> To Date:</fo:inline>
					<xsl:value-of select="toDate" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Revenue Code:</fo:inline>
					<xsl:value-of select="revenueCode" />
				</fo:block>
			</fo:table-cell>
		</fo:table-row>
		<fo:table-row>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Procedure Code:</fo:inline>
					<xsl:value-of select="procedureCode" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Modifiers:</fo:inline>
					<xsl:value-of select="modifiersList" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Diagnosis:</fo:inline>
					<xsl:value-of select="diagnosisCode" />
				</fo:block>
			</fo:table-cell>
		</fo:table-row>
		<fo:table-row>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Billed Amount:</fo:inline>
					<xsl:value-of select="billedAmount" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Billed Units:</fo:inline>
					<xsl:value-of select="billedUnits" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600">Prior Auth 1:</fo:inline>
					<xsl:value-of select="priorAuth1" />
				</fo:block>
			</fo:table-cell>
		</fo:table-row>
		<fo:table-row>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600">Prior Auth 2:</fo:inline>
					<xsl:value-of select="priorAuth2" />
				</fo:block>
			</fo:table-cell>
		</fo:table-row>



		<xsl:apply-templates select="servicing" mode="lineServicing" />

		<xsl:call-template name="createServiceFacility" />

		<!-- 
		<fo:table-row background-color="#c2d1f2">
			<fo:table-cell number-columns-spanned="3">
				<fo:block-container>
					<fo:table table-layout="fixed" width="100%" border-collapse="separate" border-spacing="5pt 10pt">
						<fo:table-column column-width="33%" />
						<fo:table-column column-width="33%" />
						<fo:table-column column-width="33%" />
		
						<fo:table-body>
							<xsl:apply-templates select="serviceFacility" />
						</fo:table-body>
					</fo:table>
				</fo:block-container>
			</fo:table-cell>
		</fo:table-row>		-->

		<xsl:apply-templates select="dental" mode="serviceDental" />
		<!-- 
		<fo:table-row>
			<fo:table-cell>
				<fo:block page-break-after="always">
					<fo:inline font-weight="bold"> Expected Results:</fo:inline>
				</fo:block>
			</fo:table-cell>
		</fo:table-row>
		<xsl:apply-templates select="expectedResult" mode="expectedResultServicing" />
		-->
		
		<xsl:call-template name="createExpectedElement" />
	</xsl:template>

	<xsl:template match="dental" mode="serviceDental">
		<fo:table-row>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600">Tooth Code:</fo:inline>

					<xsl:for-each select="toothCodeList">
						<xsl:value-of select="." />
						,
					</xsl:for-each>
				</fo:block>
			</fo:table-cell>

			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600">Oral Cavity Designation Codes:
					</fo:inline>

					<xsl:for-each select="oralCavityDesignationCodeList">
						<xsl:value-of select="." />
						,
					</xsl:for-each>
				</fo:block>
			</fo:table-cell>

		</fo:table-row>
	</xsl:template>

	<!--
	<xsl:template match="serviceFacility" priority="2">
		<fo:table-row>
			<fo:table-cell number-columns-spanned="3">
				<fo:block>
						<fo:inline font-weight="bold">Service Facility:</fo:inline>
				</fo:block>
			</fo:table-cell>
		</fo:table-row>
		
		<fo:table-row>

			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Identifier:&#160;</fo:inline>
					<xsl:value-of select="npi" />
				</fo:block>
			</fo:table-cell>


			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Taxonomy:&#160;</fo:inline>
					<xsl:value-of select="taxonomy" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> First Name: &#160;</fo:inline>

					<xsl:value-of select="firstName" />
				</fo:block>
			</fo:table-cell>
		</fo:table-row>

		<fo:table-row>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Last Name:&#160;</fo:inline>
					<xsl:value-of select="lastName" />
				</fo:block>
			</fo:table-cell>

			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Organization Name:&#160; </fo:inline>
					<xsl:value-of select="organizationName" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> SSN / EIN:&#160;</fo:inline>
					<xsl:value-of select="taxId" />
				</fo:block>
			</fo:table-cell>

		</fo:table-row>
		<fo:table-row>

			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Type:&#160;</fo:inline>
					<xsl:value-of select="type" />
				</fo:block>
			</fo:table-cell>
		</fo:table-row>

		<xsl:apply-templates select="address" />
	</xsl:template>
	-->

	<xsl:template match="address" priority="7">
		<fo:table-row>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Address:&#160;</fo:inline>
					<xsl:value-of select="address" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600">City:&#160;</fo:inline>

					<xsl:value-of select="city" />
				</fo:block>
			</fo:table-cell>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> State:&#160;</fo:inline>
					<xsl:value-of select="state" />
				</fo:block>
			</fo:table-cell>

		</fo:table-row>

		<fo:table-row>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600"> Zipcode:&#160;</fo:inline>
					<xsl:value-of select="zipcode" />
				</fo:block>
			</fo:table-cell>
		</fo:table-row>
	</xsl:template>

	<xsl:template match="servicing" mode="lineServicing">
		<fo:table-row>
			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600">NPI:&#160;</fo:inline>
					<xsl:value-of select="npi" />
				</fo:block>
			</fo:table-cell>



			<fo:table-cell>
				<fo:block>
					<fo:inline font-weight="600">Taxonomy:&#160;</fo:inline>
					<xsl:value-of select="taxonomy" />
				</fo:block>
			</fo:table-cell>
		</fo:table-row>
	</xsl:template>

</xsl:stylesheet>