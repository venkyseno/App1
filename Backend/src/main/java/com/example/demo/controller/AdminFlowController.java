package com.example.demo.controller;

import com.example.demo.model.*;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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

    private static String trimOrEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    @GetMapping("/banners")
    public List<Banner> adminBanners() { return bannerRepository.findAll(); }

    @PostMapping("/banners")
    public Banner saveBanner(@RequestBody Banner banner) {
        if (trimOrEmpty(banner.getTitle()).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Banner title is required");
        }
        if (trimOrEmpty(banner.getImageUrl()).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Banner image is required");
        }
        if (banner.getActive() == null) banner.setActive(true);
        if (banner.getSortOrder() == null) banner.setSortOrder(1);
        return bannerRepository.save(banner);
    }

    @PutMapping("/banners/{id}")
    public Banner updateBanner(@PathVariable Long id, @RequestBody Banner payload) {
        Banner banner = bannerRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (trimOrEmpty(payload.getTitle()).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Banner title is required");
        }
        if (trimOrEmpty(payload.getImageUrl()).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Banner image is required");
        }
        banner.setTitle(payload.getTitle());
        banner.setImageUrl(payload.getImageUrl());
        banner.setRedirectPath(payload.getRedirectPath());
        banner.setSortOrder(payload.getSortOrder() == null ? 1 : payload.getSortOrder());
        banner.setActive(payload.getActive() == null ? true : payload.getActive());
        return bannerRepository.save(banner);
    }

    @DeleteMapping("/banners/{id}")
    public void deleteBanner(@PathVariable Long id) { bannerRepository.deleteById(id); }

    @GetMapping("/other-services")
    public List<OtherService> adminOtherServices() { return otherServiceRepository.findAll(); }

    @PostMapping("/other-services")
    public OtherService saveOtherService(@RequestBody OtherService service) {
        if (trimOrEmpty(service.getName()).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Other service name is required");
        }
        if (trimOrEmpty(service.getImageUrl()).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Other service image is required");
        }
        if (service.getActive() == null) service.setActive(true);
        return otherServiceRepository.save(service);
    }

    @PutMapping("/other-services/{id}")
    public OtherService updateOtherService(@PathVariable Long id, @RequestBody OtherService payload) {
        OtherService service = otherServiceRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (trimOrEmpty(payload.getName()).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Other service name is required");
        }
        if (trimOrEmpty(payload.getImageUrl()).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Other service image is required");
        }
        service.setName(payload.getName());
        service.setMenuDetails(payload.getMenuDetails());
        service.setImageUrl(payload.getImageUrl());
        service.setStartPrice(payload.getStartPrice());
        service.setActive(payload.getActive() == null ? true : payload.getActive());
        return otherServiceRepository.save(service);
    }

    @DeleteMapping("/other-services/{id}")
    public void deleteOtherService(@PathVariable Long id) { otherServiceRepository.deleteById(id); }

    @GetMapping("/coupons")
    public List<Coupon> adminCoupons() { return couponRepository.findAll(); }

    @PostMapping("/coupons")
    public Coupon saveCoupon(@RequestBody Coupon coupon) { return couponRepository.save(coupon); }

    @PutMapping("/coupons/{id}")
    public Coupon updateCoupon(@PathVariable Long id, @RequestBody Coupon payload) {
        Coupon coupon = couponRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        coupon.setCode(payload.getCode());
        coupon.setMessage(payload.getMessage());
        coupon.setActive(payload.getActive());
        return couponRepository.save(coupon);
    }

    @DeleteMapping("/coupons/{id}")
    public void deleteCoupon(@PathVariable Long id) { couponRepository.deleteById(id); }

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

    @PostMapping("/worker-applications/{id}/reject")
    public WorkerApplication rejectWorker(@PathVariable Long id) {
        WorkerApplication application = workerApplicationRepository.findById(id).orElseThrow();
        application.setStatus("REJECTED");
        return workerApplicationRepository.save(application);
    }

    @GetMapping("/cases")
    public List<ServiceCase> allCases() { return serviceCaseRepository.findAll(); }

    @GetMapping("/users/workers")
    public List<User> allWorkers() { return userRepository.findAll().stream().filter(u -> u.getRole() == UserRole.WORKER).toList(); }

    @PutMapping("/users/workers/{id}")
    public User updateWorker(@PathVariable Long id, @RequestBody User payload) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (user.getRole() != UserRole.WORKER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not a worker");
        }
        user.setName(payload.getName());
        user.setMobile(payload.getMobile());
        return userRepository.save(user);
    }

    @DeleteMapping("/users/workers/{id}")
    public void deleteWorker(@PathVariable Long id) { userRepository.deleteById(id); }
}
