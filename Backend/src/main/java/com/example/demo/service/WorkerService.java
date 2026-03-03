package com.example.demo.service;

import com.example.demo.exception.BusinessException;
import com.example.demo.exception.InvalidLifecycleTransitionException;
import com.example.demo.model.CaseStatus;
import com.example.demo.model.ServiceCase;
import com.example.demo.repository.ServiceCaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WorkerService {

    private final ServiceCaseRepository repository;

    private ServiceCase getCase(Long caseId) {
        return repository.findById(caseId)
                .orElseThrow(() -> new BusinessException("Case not found: " + caseId));
    }

    public ServiceCase assignWorker(Long caseId, Long workerId) {
        ServiceCase serviceCase = getCase(caseId);

        if (serviceCase.getStatus() != CaseStatus.CREATED) {
            throw new BusinessException("Worker can only be assigned to CREATED cases");
        }

        serviceCase.setWorkerId(workerId);
        serviceCase.setStatus(CaseStatus.ASSIGNED);
        return repository.save(serviceCase);
    }

    public ServiceCase startWork(Long caseId, Long workerId) {
        ServiceCase serviceCase = getCase(caseId);

        if (serviceCase.getStatus() != CaseStatus.ASSIGNED) {
            throw new BusinessException("Work can only start on ASSIGNED cases");
        }
        if (!workerId.equals(serviceCase.getWorkerId())) {
            throw new BusinessException("This worker is not assigned to the case");
        }

        serviceCase.setStatus(CaseStatus.IN_PROGRESS);
        return repository.save(serviceCase);
    }

    public ServiceCase markWorkCompleted(Long caseId, Long workerId) {
        ServiceCase serviceCase = getCase(caseId);

        if (serviceCase.getStatus() != CaseStatus.IN_PROGRESS) {
            throw new InvalidLifecycleTransitionException("Only IN_PROGRESS cases can be completed");
        }
        if (!workerId.equals(serviceCase.getWorkerId())) {
            throw new InvalidLifecycleTransitionException("Only the assigned worker can complete the work");
        }

        serviceCase.setStatus(CaseStatus.WORK_DONE);
        return repository.save(serviceCase);
    }
}
