package com.yorosis.livetester.service;

import java.util.UUID;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.altova.TraceTarget;
import com.altova.yorosis.inst.io.Input;
import com.altova.yorosis.inst.io.Output;
import com.altova.yorosis.inst.io.StringInput;
import com.altova.yorosis.inst.io.StringOutput;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.yorosis.inst.edi.InstitutionalEdiMappingMapTo837I;
import com.yorosis.inst.edi.InstitutionalEdiMappingMapTo837_Q3;
import com.yorosis.livetester.entities.BatchTestcases;
import com.yorosis.livetester.entities.Testcases;
import com.yorosis.livetester.repo.TestcasesRepository;
import com.yorosis.mapforce.edi.DentalEdiMappingMapTo837D;
import com.yorosis.mapforce.edi.DentalEdiMappingMapTo837_Q2;
import com.yorosis.prof.edi.ProfessionalEdiMappingMapTo837P;
import com.yorosis.prof.edi.ProfessionalEdiMappingMapTo837_Q1;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class EDIFileGenerationService {

	private static final String ERROR_OCCURRED = "Error occurred";
	@Autowired
	private TestcasesRepository claimRepo;

	public void generateEDI(BatchTestcases batchTestcase) throws Exception {
		log.info("Now generating the edi for testcase: {}", batchTestcase.getId());
		
		String formType = getFormType(batchTestcase);
		log.info("Form type for testcase: {} is {}", batchTestcase.getId(), formType);
		
		if (StringUtils.equalsIgnoreCase(formType, "I")) {
			updateInstitutionalClaimInfo(batchTestcase);
		} else if (StringUtils.equalsIgnoreCase(formType, "P")) {
			updateProfessionalClaimInfo(batchTestcase);
		} else if (StringUtils.equalsIgnoreCase(formType, "D")) {
			updateDentalClaimInfo(batchTestcase);
		} else {
			log.error("Form Type not supported {}", formType);
		}
	}

	private String getFormType(BatchTestcases batchTestcase) {
		if (batchTestcase != null && batchTestcase.getClaims() != null && batchTestcase.getClaims().getFormType() != null) {
			return batchTestcase.getClaims().getFormType().getCode();
		}
		return StringUtils.EMPTY;
	}

	private void updateProfessionalClaimInfo(BatchTestcases batchTestcase) throws Exception {
		updateBatchCase(batchTestcase);

		com.altova.yorosis.prof.TraceTarget ttc = new ProfTraceTargetConsole();

		ProfessionalEdiMappingMapTo837P profEdiMappingMapTo837PObject = new ProfessionalEdiMappingMapTo837P();

		profEdiMappingMapTo837PObject.registerTraceTarget(ttc);

		try {
			com.altova.yorosis.prof.io.Input newClaimUi2Source = new com.altova.yorosis.prof.io.StringInput(batchTestcase.getGeneratedJson());
			com.altova.yorosis.prof.io.Output name837P2Target = new com.altova.yorosis.prof.io.StringOutput();

			profEdiMappingMapTo837PObject.run(newClaimUi2Source, name837P2Target);
			String interim = name837P2Target.getWriter().toString();

			ProfessionalEdiMappingMapTo837_Q1 profEdiMappingMapTo837Q1Object = new ProfessionalEdiMappingMapTo837_Q1();

			profEdiMappingMapTo837Q1Object.registerTraceTarget(ttc);

			com.altova.yorosis.prof.io.Input name837P2Source = new com.altova.yorosis.prof.io.StringInput(interim);
			com.altova.yorosis.prof.io.Output name83Q1Target = new com.altova.yorosis.prof.io.StringOutput();

			profEdiMappingMapTo837Q1Object.run(name837P2Source, name83Q1Target);

			String finalEDI = name83Q1Target.getWriter().toString();
			batchTestcase.setGeneratedEdi(finalEDI);
		} catch (Exception e) {
			log.warn(ERROR_OCCURRED, e);
			throw e;
		}
	}

	private void updateInstitutionalClaimInfo(BatchTestcases batchTestcase) throws Exception {
		updateBatchCase(batchTestcase);

		InstTraceTargetConsole ttc = new InstTraceTargetConsole();

		InstitutionalEdiMappingMapTo837I institutionalEdiMappingMapTo837IObject = new InstitutionalEdiMappingMapTo837I();

		institutionalEdiMappingMapTo837IObject.registerTraceTarget(ttc);

		try {
			Input newClaimUi2Source = new StringInput(batchTestcase.getGeneratedJson());
			Output name837I2Target = new StringOutput();

			institutionalEdiMappingMapTo837IObject.run(newClaimUi2Source, name837I2Target);

			String interim = name837I2Target.getWriter().toString();

			InstitutionalEdiMappingMapTo837_Q3 institutionalEdiMappingMapTo837Q3Object = new InstitutionalEdiMappingMapTo837_Q3();
			institutionalEdiMappingMapTo837Q3Object.registerTraceTarget(ttc);

			Input name837I2Source = new StringInput(interim);
			Output name837Q3Target = new StringOutput();

			institutionalEdiMappingMapTo837Q3Object.run(name837I2Source, name837Q3Target);

			String finalEDI = name837Q3Target.getWriter().toString();
			batchTestcase.setGeneratedEdi(finalEDI);
		} catch (Exception e) {
			log.warn(ERROR_OCCURRED, e);
			throw e;
		}
	}

	private void updateDentalClaimInfo(BatchTestcases batchTestcase) throws Exception {
		updateBatchCase(batchTestcase);

		TraceTarget ttc = new DentalTraceTargetConsole();

		DentalEdiMappingMapTo837D dentalEdiMappingMapTo837PObject = new DentalEdiMappingMapTo837D();

		dentalEdiMappingMapTo837PObject.registerTraceTarget(ttc);

		try {
			com.altova.io.Input newClaimUi2Source = new com.altova.io.StringInput(batchTestcase.getGeneratedJson());
			com.altova.io.Output name837D2Target = new com.altova.io.StringOutput();

			dentalEdiMappingMapTo837PObject.run(newClaimUi2Source, name837D2Target);
			String interim = name837D2Target.getWriter().toString();

			DentalEdiMappingMapTo837_Q2 dentalEdiMappingMapTo837Q2Object = new DentalEdiMappingMapTo837_Q2();

			dentalEdiMappingMapTo837Q2Object.registerTraceTarget(ttc);

			com.altova.io.Input name837D2Source = new com.altova.io.StringInput(interim);
			com.altova.io.Output name837Q2Target = new com.altova.io.StringOutput();

			dentalEdiMappingMapTo837Q2Object.run(name837D2Source, name837Q2Target);

			/////

			String finalEDI = name837Q2Target.getWriter().toString();
			batchTestcase.setGeneratedEdi(finalEDI);
		} catch (Exception e) {
			log.warn(ERROR_OCCURRED, e);
			throw e;
		}
	}

	private void updateBatchCase(BatchTestcases batchTestcase) {
		String patientPCN = UUID.randomUUID().toString();

		Testcases claimEntity = claimRepo.getOne(batchTestcase.getClaims().getId());

		JsonElement jsonElement = new JsonParser().parse(claimEntity.getJsonData());
		JsonObject jsonObj = jsonElement.getAsJsonObject();
		JsonElement claimElement = jsonObj.get("claimHeader");
		JsonObject claimJsonObj = claimElement.getAsJsonObject();

		claimJsonObj.remove("patientControlNo");
		claimJsonObj.addProperty("patientControlNo", patientPCN);

		batchTestcase.setGeneratedJson(jsonElement.toString());
		batchTestcase.setPcn(patientPCN);
	}

	class ProfTraceTargetConsole implements com.altova.yorosis.prof.TraceTarget {
		private StringBuilder buffer = new StringBuilder();

		public void writeTrace(String info) {
			buffer.append(info);
		}

		public StringBuilder getTrace() {
			return buffer;
		}
	}

	class InstTraceTargetConsole implements com.altova.yorosis.inst.TraceTarget {
		private StringBuilder buffer = new StringBuilder();

		public void writeTrace(String info) {
			buffer.append(info);
		}

		public StringBuilder getTrace() {
			return buffer;
		}
	}
	
	class DentalTraceTargetConsole implements TraceTarget {
		private StringBuilder buffer = new StringBuilder();

		public void writeTrace(String info) {
			buffer.append(info);
		}

		public StringBuilder getTrace() {
			return buffer;
		}
	}
	// update PCN / TCN in the Batch Test Case table
}
