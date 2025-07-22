// lib/screens/about_screen.dart

import 'package:flutter/material.dart';

// A simple data class for each team member
class TeamMember {
  final String name;
  final String major;
  final String year;
  final String title;
  final String specialty;

  const TeamMember({
    required this.name,
    required this.major,
    required this.year,
    required this.title,
    required this.specialty,
  });
}

class AboutScreen extends StatelessWidget {
  const AboutScreen({Key? key}) : super(key: key);

  static const List<TeamMember> _team = [
    TeamMember(
      name: 'David Tyler Jackson',
      major: 'Computer Science',
      year: '2026',
      title: 'Aspiring Software Engineer',
      specialty: 'Full Stack Developer | Project Manager',
    ),
    TeamMember(
      name: 'Giorgio Torregrosa',
      major: 'Computer Science',
      year: '2026',
      title: 'Aspiring Software Engineer',
      specialty: 'Database',
    ),
    TeamMember(
      name: 'Justin Gamboa',
      major: 'Computer Science',
      year: '2026',
      title: 'Aspiring Software Engineer',
      specialty: 'Server Pipeline',
    ),
    TeamMember(
      name: 'Aidan Halfon',
      major: 'Computer Science',
      year: '2026',
      title: 'Aspiring Software Engineer',
      specialty: 'Mobile Frontend',
    ),
    TeamMember(
      name: 'Yasmeen Moufakkir',
      major: 'Computer Science',
      year: '2026',
      title: 'Aspiring Software Engineer',
      specialty: 'Unit Testing',
    ),
    TeamMember(
      name: 'Santiago Henao Rojas',
      major: 'Computer Science',
      year: '2026',
      title: 'Aspiring Software Engineer',
      specialty: 'Mobile Backend',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Meet the Team'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
      ),
      body: Padding(
        padding: const EdgeInsets.all(12),
        child: GridView.builder(
          gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
            maxCrossAxisExtent: 300,
            mainAxisExtent: 180,
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
          ),
          itemCount: _team.length,
          itemBuilder: (context, index) {
            return _TeamCard(_team[index]);
          }
        ),
      ),
    );
  }
}

class _TeamCard extends StatelessWidget {
  final TeamMember member;
  const _TeamCard(this.member);

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      elevation: 3,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(member.name,
                style:
                    const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(
              '${member.major} · ${member.year}',
              style: TextStyle(color: Colors.grey[600]),
            ),
            const SizedBox(height: 12),
            Text(member.title,
                style:
                    const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
            const SizedBox(height: 8),
            Text(member.specialty, style: TextStyle(color: Colors.grey[700])),
          ],
        ),
      ),
    );
  }
}
