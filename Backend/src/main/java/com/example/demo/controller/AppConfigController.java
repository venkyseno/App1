package com.example.demo.controller;

import com.example.demo.model.Banner;
import com.example.demo.model.Coupon;
import com.example.demo.model.OtherService;
import com.example.demo.model.OtherServiceItem;
import com.example.demo.repository.BannerRepository;
import com.example.demo.repository.CouponRepository;
import com.example.demo.repository.OtherServiceItemRepository;
import com.example.demo.repository.OtherServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/config")
@CrossOrigin
@RequiredArgsConstructor
public class AppConfigController {
    private final BannerRepository bannerRepository;
    private final OtherServiceRepository otherServiceRepository;
    private final OtherServiceItemRepository otherServiceItemRepository;
    private final CouponRepository couponRepository;

    @GetMapping("/banners")
    public List<Banner> getBanners() {
        return bannerRepository.findByActiveTrueOrderBySortOrderAsc();
    }

    @GetMapping("/other-services")
    public List<OtherService> getOtherServices() {
        return otherServiceRepository.findByActiveTrue();
    }

    @GetMapping("/other-services/{id}/items")
    public List<OtherServiceItem> getOtherServiceItems(@PathVariable Long id) {
        return otherServiceItemRepository.findByOtherServiceId(id);
    }

    @GetMapping("/coupons")
    public List<Coupon> getCoupons() {
        return couponRepository.findByActiveTrue();
    }
}
