package com.example.backend.repository;

import com.example.backend.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findAllByStudyGroupId(Long groupId);

    List<Application> findAllByApplicantId(Long applicantId);
}
