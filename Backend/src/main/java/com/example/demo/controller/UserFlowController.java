package com.example.demo.controller;

import com.example.demo.model.Address;
import com.example.demo.model.WorkerApplication;
import com.example.demo.repository.AddressRepository;
import com.example.demo.repository.WorkerApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/user-flow")
@CrossOrigin
@RequiredArgsConstructor
public class UserFlowController {
    private final AddressRepository addressRepository;
    private final WorkerApplicationRepository workerApplicationRepository;

    @GetMapping("/addresses/{userId}")
    public List<Address> getAddresses(@PathVariable Long userId) {
        return addressRepository.findByUserId(userId);
    }

    @PostMapping("/addresses")
    public Address addAddress(@RequestBody Address address) {
        if (address.getAddressLine() == null || address.getAddressLine().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Address is mandatory");
        }
        if (address.getCity() == null || address.getCity().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "City is mandatory");
        }
        if (Boolean.TRUE.equals(address.getPrimaryAddress())) {
            addressRepository.findByUserId(address.getUserId()).forEach(a -> {
                if (Boolean.TRUE.equals(a.getPrimaryAddress())) {
                    a.setPrimaryAddress(false);
                    addressRepository.save(a);
                }
            });
        }
        return addressRepository.save(address);
    }

    @PostMapping("/worker-apply")
    public WorkerApplication workerApply(@RequestBody WorkerApplication request) {
        request.setStatus("PENDING");
        return workerApplicationRepository.save(request);
    }
}
