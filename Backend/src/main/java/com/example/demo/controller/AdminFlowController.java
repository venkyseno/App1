package com.example.demo.controller;

import com.example.demo.model.*;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin
@RequiredArgsConstructor
public class AdminFlowController {
    private final BannerRepository bannerRepository;
    private final OtherServiceRepository otherServiceRepository;
    private final CouponRepository couponRepository;
    private final WorkerApplicationRepository workerApplicationRepository;
    private final UserRepository userRepository;
    private final ServiceCaseRepository serviceCaseRepository;

    @GetMapping("/banners")
    public List<Banner> adminBanners() { return bannerRepository.findAll(); }

    @PostMapping("/banners")
    public Banner saveBanner(@RequestBody Banner banner) { return bannerRepository.save(banner); }

    @GetMapping("/other-services")
    public List<OtherService> adminOtherServices() { return otherServiceRepository.findAll(); }

    @PostMapping("/other-services")
    public OtherService saveOtherService(@RequestBody OtherService service) { return otherServiceRepository.save(service); }

    @GetMapping("/coupons")
    public List<Coupon> adminCoupons() { return couponRepository.findAll(); }

    @PostMapping("/coupons")
    public Coupon saveCoupon(@RequestBody Coupon coupon) { return couponRepository.save(coupon); }

    @GetMapping("/worker-applications")
    public List<WorkerApplication> workerApplications() { return workerApplicationRepository.findAll(); }

    @PostMapping("/worker-applications/{id}/approve")
    public WorkerApplication approveWorker(@PathVariable Long id) {
        WorkerApplication application = workerApplicationRepository.findById(id).orElseThrow();
        application.setStatus("APPROVED");
        User user = userRepository.findById(application.getUserId()).orElseThrow();
        user.setRole(UserRole.WORKER);
        userRepository.save(user);
        return workerApplicationRepository.save(application);
    }

    @GetMapping("/cases")
    public List<ServiceCase> allCases() { return serviceCaseRepository.findAll(); }

    @GetMapping("/users/workers")
    public List<User> allWorkers() { return userRepository.findAll().stream().filter(u -> u.getRole() == UserRole.WORKER).toList(); }
}
