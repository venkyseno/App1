package com.example.demo.controller;

import com.example.demo.config.StaticResourceConfig;
import org.springframework.http.HttpStatus;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/uploads")
@CrossOrigin
public class FileUploadController {

    @PostMapping
    public Map<String, String> upload(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is required");
        }

        try {
            String cleanName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "upload.bin" : file.getOriginalFilename());
            String ext = "";
            int idx = cleanName.lastIndexOf('.');
            if (idx >= 0) ext = cleanName.substring(idx);
            String storedName = UUID.randomUUID() + ext;

            Path uploadDir = StaticResourceConfig.uploadRoot();
            Files.createDirectories(uploadDir);
            Path target = uploadDir.resolve(storedName);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            return Map.of("url", "/uploads/" + storedName);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "File upload failed: " + e.getMessage());
        }
    }
}
